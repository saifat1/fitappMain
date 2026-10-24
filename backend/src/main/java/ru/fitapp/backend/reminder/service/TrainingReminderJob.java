package ru.fitapp.backend.reminder.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.mail.MailService;
import ru.fitapp.backend.notification.service.NotificationService;
import ru.fitapp.backend.pushsubscription.repository.DevicePushTokenRepository;
import ru.fitapp.backend.pushsubscription.repository.PushSubscriptionRepository;
import ru.fitapp.backend.reminder.entity.ReminderLog;
import ru.fitapp.backend.reminder.repository.ReminderLogRepository;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.model.TrainingType;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * FIT-75 (agreed 24.10.2026): the client is reminded the evening before (19:00) and ~2 hours before a training,
 * the trainer gets a summary of the day at 08:00. Nothing is sent 22:00–08:00. A client without push (no app
 * with notifications allowed, no browser subscription) also gets the evening reminder by email.
 *
 * Training times are Moscow wall-clock times (no zone in the DB) while the server runs in UTC — hence the
 * explicit zone. Runs every 5 minutes; reminder_log makes every reminder go out once, and the time windows
 * let it catch up after a restart.
 */
@Component
public class TrainingReminderJob {

    private static final Logger log = LoggerFactory.getLogger(TrainingReminderJob.class);

    private static final LocalTime EVENING_AT = LocalTime.of(19, 0);
    private static final LocalTime QUIET_FROM = LocalTime.of(22, 0);
    private static final LocalTime QUIET_TO = LocalTime.of(8, 0);
    private static final LocalTime TRAINER_DAY_UNTIL = LocalTime.of(11, 0);
    private static final long SOON_HOURS = 2;

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("dd.MM");
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("HH:mm");

    private final TrainingRepository trainingRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final NotificationService notificationService;
    private final MailService mailService;
    private final DevicePushTokenRepository devicePushTokenRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;

    @Value("${app.reminders.enabled:true}")
    private boolean enabled;

    @Value("${app.reminders.zone:Europe/Moscow}")
    private String zone;

    @Value("${app.public-base-url:http://localhost:3000}")
    private String publicBaseUrl;

    public TrainingReminderJob(
            TrainingRepository trainingRepository,
            ReminderLogRepository reminderLogRepository,
            NotificationService notificationService,
            MailService mailService,
            DevicePushTokenRepository devicePushTokenRepository,
            PushSubscriptionRepository pushSubscriptionRepository
    ) {
        this.trainingRepository = trainingRepository;
        this.reminderLogRepository = reminderLogRepository;
        this.notificationService = notificationService;
        this.mailService = mailService;
        this.devicePushTokenRepository = devicePushTokenRepository;
        this.pushSubscriptionRepository = pushSubscriptionRepository;
    }

    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void sendReminders() {
        if (!enabled) {
            return;
        }
        ZoneId zoneId = ZoneId.of(zone);
        LocalDateTime now = LocalDateTime.now(zoneId);
        LocalTime time = now.toLocalTime();
        if (time.isBefore(QUIET_TO) || !time.isBefore(QUIET_FROM)) {
            return;
        }

        LocalDate today = now.toLocalDate();
        List<Training> trainings = trainingRepository.findForReminders(
                today, today.plusDays(1), TrainingStatus.PLANNED, TrainingType.CONTRACT_TYPES);

        if (time.isBefore(TRAINER_DAY_UNTIL)) {
            sendTrainerDaySummaries(today, trainings);
        }
        for (Training training : trainings) {
            if (!remindsClient(training)) {
                continue;
            }
            LocalDateTime slot = LocalDateTime.of(training.getTrainingDate(), training.getStartTime());
            LocalDateTime createdAt = inZone(training.getCreatedAt(), zoneId);

            // The evening before; not for a training added after 19:00 — the client has just agreed on it.
            if (!time.isBefore(EVENING_AT) && training.getTrainingDate().equals(today.plusDays(1))
                    && createdAt.isBefore(today.atTime(EVENING_AT))) {
                send(ReminderLog.Kind.CLIENT_EVENING, training, slot);
            }
            // ~2 hours before; not when it was created within those 2 hours.
            if (slot.isAfter(now) && !slot.isAfter(now.plusHours(SOON_HOURS))
                    && createdAt.isBefore(slot.minusHours(SOON_HOURS))) {
                send(ReminderLog.Kind.CLIENT_SOON, training, slot);
            }
        }
    }

    private boolean remindsClient(Training training) {
        AppUser client = training.getClient();
        // Clients added by the trainer who never registered have no app, push or real email.
        return client != null
                && client.getStatus() == UserStatus.ACTIVE
                && client.isClaimedByClient()
                && client.isTrainingReminders();
    }

    private void send(ReminderLog.Kind kind, Training training, LocalDateTime slot) {
        if (reminderLogRepository.existsByKindAndRefIdAndSlot(kind, training.getId(), slot)) {
            return;
        }
        try {
            String when = kind == ReminderLog.Kind.CLIENT_EVENING
                    ? "Завтра, " + slot.format(DAY) + " в " + slot.format(TIME)
                    : "Сегодня в " + slot.format(TIME);
            notificationService.notifyTrainingReminder(training, when);
            if (kind == ReminderLog.Kind.CLIENT_EVENING && !hasPush(training.getClient())) {
                mailService.sendNotification(
                        training.getClient().getEmail(),
                        "Напоминание: завтра тренировка в " + slot.format(TIME),
                        eveningEmail(training, slot)
                );
            }
            reminderLogRepository.save(new ReminderLog(kind, training.getId(), slot));
        } catch (Exception ex) {
            // One failed reminder must not stop the rest; it's retried on the next run.
            log.error("Failed to send {} reminder for training {}: {}", kind, training.getId(), ex.getMessage());
        }
    }

    private void sendTrainerDaySummaries(LocalDate today, List<Training> trainings) {
        Map<Long, List<Training>> byTrainer = new LinkedHashMap<>();
        for (Training training : trainings) {
            if (training.getTrainingDate().equals(today)) {
                byTrainer.computeIfAbsent(training.getTrainer().getId(), key -> new ArrayList<>()).add(training);
            }
        }
        LocalDateTime slot = today.atStartOfDay();
        byTrainer.forEach((trainerId, list) -> {
            AppUser trainer = list.get(0).getTrainer();
            if (trainer.getStatus() != UserStatus.ACTIVE || !trainer.isTrainingReminders()
                    || reminderLogRepository.existsByKindAndRefIdAndSlot(ReminderLog.Kind.TRAINER_DAY, trainerId, slot)) {
                return;
            }
            try {
                Training first = list.get(0);
                String body = list.size() + " " + trainingsWord(list.size())
                        + ", первая в " + first.getStartTime().format(TIME)
                        + (first.getClient() != null ? " — " + fullName(first.getClient()) : "");
                notificationService.notifyTrainerDaySummary(trainer, body);
                reminderLogRepository.save(new ReminderLog(ReminderLog.Kind.TRAINER_DAY, trainerId, slot));
            } catch (Exception ex) {
                log.error("Failed to send the day summary to trainer {}: {}", trainerId, ex.getMessage());
            }
        });
    }

    private boolean hasPush(AppUser user) {
        return devicePushTokenRepository.existsByUserId(user.getId())
                || pushSubscriptionRepository.existsByUserId(user.getId());
    }

    private String eveningEmail(Training training, LocalDateTime slot) {
        String name = training.getClient().getFirstName();
        return (name != null && !name.isBlank() ? "Здравствуйте, " + name.trim() + "!" : "Здравствуйте!") + "\n\n"
                + "Напоминаем: завтра, " + slot.format(DAY) + ", в " + slot.format(TIME) + " у вас тренировка"
                + " с тренером " + fullName(training.getTrainer()) + ".\n\n"
                + "Если не получается прийти — перенесите или отмените её в приложении:\n"
                + publicBaseUrl + "/trainings/" + training.getId() + "\n\n"
                + "Отключить напоминания можно в профиле.\n\nFitApp";
    }

    /** created_at is written in the server's (JVM) zone. */
    private static LocalDateTime inZone(LocalDateTime serverTime, ZoneId zoneId) {
        return serverTime == null
                ? LocalDateTime.MIN
                : serverTime.atZone(ZoneId.systemDefault()).withZoneSameInstant(zoneId).toLocalDateTime();
    }

    private static String fullName(AppUser user) {
        String name = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();
        return name.isEmpty() ? user.getEmail() : name;
    }

    static String trainingsWord(int count) {
        int mod100 = count % 100;
        int mod10 = count % 10;
        if (mod100 >= 11 && mod100 <= 14) {
            return "тренировок";
        }
        if (mod10 == 1) {
            return "тренировка";
        }
        return mod10 >= 2 && mod10 <= 4 ? "тренировки" : "тренировок";
    }
}
