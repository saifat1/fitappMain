package ru.fitapp.backend.notification.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.bookingrequest.entity.BookingRequest;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.notification.dto.NotificationResponse;
import ru.fitapp.backend.notification.entity.Notification;
import ru.fitapp.backend.notification.model.NotificationType;
import ru.fitapp.backend.notification.repository.NotificationRepository;
import ru.fitapp.backend.pushsubscription.service.WebPushService;
import ru.fitapp.backend.reschedule.entity.RescheduleRequest;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class NotificationService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final int DEFAULT_PAGE_SIZE = 100;

    private final NotificationRepository notificationRepository;
    private final WebPushService webPushService;
    private final CurrentUserService currentUserService;

    public NotificationService(
            NotificationRepository notificationRepository,
            WebPushService webPushService,
            CurrentUserService currentUserService
    ) {
        this.notificationRepository = notificationRepository;
        this.webPushService = webPushService;
        this.currentUserService = currentUserService;
    }

    // ---------- Booking requests (client requests a training slot) ----------

    public void notifyBookingRequestCreated(BookingRequest request) {
        create(
                request.getTrainer(),
                request.getClient(),
                NotificationType.BOOKING_REQUEST_CREATED,
                "Заявка на тренировку",
                trainingSlotBody(request.getRequestedStart().toLocalDate(), request.getRequestedStart().toLocalTime()),
                "BOOKING_REQUEST",
                request.getId()
        );
    }

    public void notifyBookingRequestApproved(BookingRequest request) {
        create(
                request.getClient(),
                request.getTrainer(),
                NotificationType.BOOKING_REQUEST_APPROVED,
                "Заявка подтверждена",
                trainingSlotBody(request.getRequestedStart().toLocalDate(), request.getRequestedStart().toLocalTime()),
                "BOOKING_REQUEST",
                request.getId()
        );
    }

    public void notifyBookingRequestDeclined(BookingRequest request) {
        create(
                request.getClient(),
                request.getTrainer(),
                NotificationType.BOOKING_REQUEST_DECLINED,
                "Заявка отклонена",
                trainingSlotBody(request.getRequestedStart().toLocalDate(), request.getRequestedStart().toLocalTime()),
                "BOOKING_REQUEST",
                request.getId()
        );
    }

    // ---------- Reschedule requests ----------

    public void notifyRescheduleRequestCreated(RescheduleRequest request) {
        AppUser trainer = request.getTraining().getTrainer();
        AppUser client = request.getTraining().getClient();

        create(
                trainer,
                client,
                NotificationType.RESCHEDULE_REQUEST_CREATED,
                "Заявка на перенос",
                trainingSlotBody(request.getRequestedTrainingDate(), request.getRequestedStartTime()),
                "RESCHEDULE_REQUEST",
                request.getId()
        );
    }

    public void notifyRescheduleRequestApproved(RescheduleRequest request) {
        AppUser trainer = request.getTraining().getTrainer();
        AppUser client = request.getTraining().getClient();

        create(
                client,
                trainer,
                NotificationType.RESCHEDULE_REQUEST_APPROVED,
                "Перенос подтверждён",
                trainingSlotBody(request.getRequestedTrainingDate(), request.getRequestedStartTime()),
                "RESCHEDULE_REQUEST",
                request.getId()
        );
    }

    public void notifyRescheduleRequestRejected(RescheduleRequest request) {
        AppUser trainer = request.getTraining().getTrainer();
        AppUser client = request.getTraining().getClient();

        create(
                client,
                trainer,
                NotificationType.RESCHEDULE_REQUEST_REJECTED,
                "Перенос отклонён",
                trainingSlotBody(request.getRequestedTrainingDate(), request.getRequestedStartTime()),
                "RESCHEDULE_REQUEST",
                request.getId()
        );
    }

    // ---------- Training status changes ----------

    public void notifyTrainingCancelledByClient(Training training) {
        create(
                training.getTrainer(),
                training.getClient(),
                NotificationType.TRAINING_CANCELLED_BY_CLIENT,
                "Отмена тренировки",
                trainingSlotBody(training.getTrainingDate(), training.getStartTime()),
                "TRAINING",
                training.getId()
        );
    }

    public void notifyTrainingCancelledByTrainer(Training training) {
        if (training.getClient() == null) {
            return;
        }

        create(
                training.getClient(),
                training.getTrainer(),
                NotificationType.TRAINING_CANCELLED_BY_TRAINER,
                "Тренировка отменена",
                trainingSlotBody(training.getTrainingDate(), training.getStartTime()),
                "TRAINING",
                training.getId()
        );
    }

    public void notifyTrainingCompleted(Training training) {
        if (training.getClient() == null) {
            return;
        }

        create(
                training.getClient(),
                training.getTrainer(),
                NotificationType.TRAINING_COMPLETED,
                "Тренировка проведена",
                trainingSlotBody(training.getTrainingDate(), training.getStartTime()),
                "TRAINING",
                training.getId()
        );
    }

    // ---------- New client ----------

    public void notifyNewClient(AppUser trainer, AppUser client) {
        create(
                trainer,
                client,
                NotificationType.NEW_CLIENT,
                "Клиент зарегистрирован",
                null,
                "CLIENT",
                client.getId()
        );
    }

    // ---------- Reading ----------

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        AppUser currentUser = currentUserService.getCurrentUser();

        return notificationRepository
                .findAllByRecipientIdOrderByCreatedAtDesc(currentUser.getId(), PageRequest.of(0, DEFAULT_PAGE_SIZE))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        AppUser currentUser = currentUserService.getCurrentUser();
        return notificationRepository.countByRecipientIdAndReadFalse(currentUser.getId());
    }

    public NotificationResponse markAsRead(Long id) {
        AppUser currentUser = currentUserService.getCurrentUser();

        Notification notification = notificationRepository.findByIdAndRecipientId(id, currentUser.getId())
                .orElseThrow(() -> new ApiException("NOTIFICATION_NOT_FOUND", "Уведомление не найдено"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return toResponse(notification);
    }

    public void markAllAsRead() {
        AppUser currentUser = currentUserService.getCurrentUser();
        notificationRepository.markAllAsReadForRecipient(currentUser.getId(), LocalDateTime.now());
    }

    // ---------- Internals ----------

    private void create(
            AppUser recipient,
            AppUser actor,
            NotificationType type,
            String title,
            String body,
            String relatedEntityType,
            Long relatedEntityId
    ) {
        Notification notification = new Notification()
                .setRecipient(recipient)
                .setActor(actor)
                .setType(type)
                .setTitle(title)
                .setBody(body)
                .setRelatedEntityType(relatedEntityType)
                .setRelatedEntityId(relatedEntityId);

        notificationRepository.save(notification);

        String pushBody = actorLabel(actor) + (body != null && !body.isBlank() ? ", " + body : "");
        webPushService.sendToUser(
                recipient,
                title,
                pushBody,
                Map.of(
                        "type", type.name(),
                        "relatedEntityType", relatedEntityType != null ? relatedEntityType : "",
                        "relatedEntityId", relatedEntityId != null ? relatedEntityId : ""
                )
        );
    }

    private String trainingSlotBody(java.time.LocalDate date, java.time.LocalTime time) {
        if (date == null) {
            return null;
        }
        String formatted = date.format(DATE_FORMATTER);
        if (time != null) {
            formatted += ", " + time.format(TIME_FORMATTER);
        }
        return formatted;
    }

    private String actorLabel(AppUser actor) {
        if (actor == null) {
            return "FitApp";
        }
        String fullName = ((actor.getFirstName() != null ? actor.getFirstName() : "") + " "
                + (actor.getLastName() != null ? actor.getLastName() : "")).trim();
        return fullName.isEmpty() ? actor.getEmail() : fullName;
    }

    private NotificationResponse toResponse(Notification notification) {
        AppUser actor = notification.getActor();

        return new NotificationResponse()
                .setId(notification.getId())
                .setType(notification.getType().name())
                .setKind(notification.getType().getKind().name())
                .setTitle(notification.getTitle())
                .setBody(notification.getBody())
                .setRelatedEntityType(notification.getRelatedEntityType())
                .setRelatedEntityId(notification.getRelatedEntityId())
                .setActorId(actor != null ? actor.getId() : null)
                .setActorName(actor != null ? actorLabel(actor) : null)
                .setRead(notification.isRead())
                .setCreatedAt(notification.getCreatedAt());
    }
}
