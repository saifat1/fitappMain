package ru.fitapp.backend.subscription.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.mail.MailService;
import ru.fitapp.backend.notification.service.NotificationService;
import ru.fitapp.backend.reminder.entity.ReminderLog;
import ru.fitapp.backend.reminder.repository.ReminderLogRepository;
import ru.fitapp.backend.subscription.entity.TrainerSubscription;
import ru.fitapp.backend.subscription.model.BillingPeriod;
import ru.fitapp.backend.subscription.model.SubscriptionStatus;
import ru.fitapp.backend.subscription.repository.TrainerSubscriptionRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * FIT-79 / FIT-80: 3 days before the paid period ends the trainer is told what happens next — «спишется 690 ₽»
 * when auto-renewal is on, «заканчивается, продлите» when it isn't; the same 3 days before the free trial ends.
 * Robokassa requires a notice before every automatic charge. Bell + push + email, once per period, in the
 * daytime (Moscow); only while billing is enabled.
 */
@Component
public class SubscriptionReminderJob {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionReminderJob.class);
    private static final int DAYS_BEFORE = 3;
    private static final LocalTime SEND_FROM = LocalTime.of(12, 0);
    private static final LocalTime SEND_UNTIL = LocalTime.of(21, 0);
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("dd.MM");

    private final TrainerSubscriptionRepository subscriptionRepository;
    private final SubscriptionAccessService accessService;
    private final ReminderLogRepository reminderLogRepository;
    private final NotificationService notificationService;
    private final MailService mailService;

    @Value("${app.reminders.zone:Europe/Moscow}")
    private String zone;

    @Value("${app.public-base-url:http://localhost:3000}")
    private String publicBaseUrl;

    public SubscriptionReminderJob(
            TrainerSubscriptionRepository subscriptionRepository,
            SubscriptionAccessService accessService,
            ReminderLogRepository reminderLogRepository,
            NotificationService notificationService,
            MailService mailService
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.accessService = accessService;
        this.reminderLogRepository = reminderLogRepository;
        this.notificationService = notificationService;
        this.mailService = mailService;
    }

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void sendReminders() {
        if (!accessService.isEnabled()) {
            return;
        }
        ZoneId zoneId = ZoneId.of(zone);
        LocalDateTime nowLocal = LocalDateTime.now(zoneId);
        if (nowLocal.toLocalTime().isBefore(SEND_FROM) || !nowLocal.toLocalTime().isBefore(SEND_UNTIL)) {
            return;
        }
        LocalDate target = nowLocal.toLocalDate().plusDays(DAYS_BEFORE);
        LocalDateTime now = LocalDateTime.now();

        for (TrainerSubscription s : subscriptionRepository.findAll()) {
            AppUser trainer = s.getTrainer();
            if (trainer.getStatus() != UserStatus.ACTIVE) {
                continue;
            }
            try {
                SubscriptionStatus status = accessService.resolve(s, now).status();
                if (status == SubscriptionStatus.ACTIVE && s.getPlan().isPaid() && s.getPaidUntil() != null
                        && inZone(s.getPaidUntil(), zoneId).toLocalDate().equals(target)) {
                    remindPeriodEnd(s, trainer, inZone(s.getPaidUntil(), zoneId));
                } else if (status == SubscriptionStatus.TRIAL && s.getTrialEndsAt() != null
                        && inZone(s.getTrialEndsAt(), zoneId).toLocalDate().equals(target)) {
                    remindTrialEnd(s, trainer, inZone(s.getTrialEndsAt(), zoneId));
                }
            } catch (Exception ex) {
                // One trainer's reminder must not stop the rest; it's retried on the next run.
                log.error("Failed to send the subscription reminder to trainer {}: {}", trainer.getId(), ex.getMessage());
            }
        }
    }

    private void remindPeriodEnd(TrainerSubscription s, AppUser trainer, LocalDateTime endsAt) {
        if (reminderLogRepository.existsByKindAndRefIdAndSlot(ReminderLog.Kind.SUBSCRIPTION_END, trainer.getId(), s.getPaidUntil())) {
            return;
        }
        String plan = s.getPlan().getTitle() + " (" + (s.getBillingPeriod() == BillingPeriod.YEAR ? "год" : "месяц") + ")";
        boolean charges = Boolean.TRUE.equals(s.getAutoRenew()) && s.getPaymentMethodToken() != null;
        String title;
        String body;
        String email;
        if (charges) {
            String amount = rub(s.getPlan().priceKopecks(s.getBillingPeriod()));
            title = "Скоро спишется оплата за подписку";
            body = "Через 3 дня, " + endsAt.format(DAY) + ", спишется " + amount + " за FitApp " + plan;
            email = body + (s.getPaymentMethodTitle() != null ? " (" + s.getPaymentMethodTitle() + ")" : "") + ".\n\n"
                    + "Если не хотите продлевать — отключите автопродление в разделе «Подписка»: "
                    + publicBaseUrl + "/subscription\nОплаченный период сохранится до конца.";
        } else {
            title = "Подписка скоро закончится";
            body = endsAt.format(DAY) + " заканчивается оплаченный период FitApp " + plan + " — продлите в разделе «Подписка»";
            email = "Через 3 дня, " + endsAt.format(DAY) + ", заканчивается оплаченный период FitApp " + plan + ". "
                    + "Автоматического списания не будет.\n\nЧтобы продолжить работу со всеми клиентами, продлите подписку: "
                    + publicBaseUrl + "/subscription\nБез продления действует бесплатный тариф «Старт» (до 3 клиентов), данные не удаляются.";
        }
        send(trainer, title, body, email);
        reminderLogRepository.save(new ReminderLog(ReminderLog.Kind.SUBSCRIPTION_END, trainer.getId(), s.getPaidUntil()));
    }

    private void remindTrialEnd(TrainerSubscription s, AppUser trainer, LocalDateTime endsAt) {
        if (reminderLogRepository.existsByKindAndRefIdAndSlot(ReminderLog.Kind.TRIAL_END, trainer.getId(), s.getTrialEndsAt())) {
            return;
        }
        String body = endsAt.format(DAY) + " заканчивается пробный период Pro — дальше бесплатный тариф «Старт» (до 3 клиентов)";
        String email = "Через 3 дня, " + endsAt.format(DAY) + ", заканчивается бесплатный пробный период FitApp Pro. "
                + "Ничего не спишется — карта не привязана.\n\nДальше действует бесплатный тариф «Старт» (до 3 активных клиентов), "
                + "данные не удаляются. Тарифы и оплата: " + publicBaseUrl + "/subscription";
        send(trainer, "Пробный период скоро закончится", body, email);
        reminderLogRepository.save(new ReminderLog(ReminderLog.Kind.TRIAL_END, trainer.getId(), s.getTrialEndsAt()));
    }

    private void send(AppUser trainer, String title, String body, String email) {
        notificationService.notifySubscriptionReminder(trainer, title, body);
        String name = trainer.getFirstName();
        mailService.sendNotification(trainer.getEmail(), "FitApp — " + title.toLowerCase(),
                (name != null && !name.isBlank() ? "Здравствуйте, " + name.trim() + "!" : "Здравствуйте!") + "\n\n" + email + "\n\nFitApp");
    }

    /** Stored times are in the server's (JVM) zone. */
    private static LocalDateTime inZone(LocalDateTime serverTime, ZoneId zoneId) {
        return serverTime.atZone(ZoneId.systemDefault()).withZoneSameInstant(zoneId).toLocalDateTime();
    }

    private static String rub(int kopecks) {
        return String.format("%,d", kopecks / 100).replace(',', ' ') + " ₽";
    }
}
