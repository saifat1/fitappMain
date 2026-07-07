package ru.fitapp.backend.notification.model;

/**
 * Every concrete notification type maps to one of three visual "kinds"
 * designed in Figma (frame "Колокольчик"): NEW_CLIENT (blue userplus icon),
 * REQUEST (green plus icon), CANCELLATION (red close icon). The kind drives
 * icon + color on the frontend; the type drives the actual copy and the
 * tap-through action.
 */
public enum NotificationType {

    // Kind: NEW_CLIENT (blue)
    NEW_CLIENT(NotificationKind.NEW_CLIENT),

    // Kind: REQUEST (green) — something awaiting a decision, or a positive outcome
    BOOKING_REQUEST_CREATED(NotificationKind.REQUEST),
    BOOKING_REQUEST_APPROVED(NotificationKind.REQUEST),
    RESCHEDULE_REQUEST_CREATED(NotificationKind.REQUEST),
    RESCHEDULE_REQUEST_APPROVED(NotificationKind.REQUEST),
    TRAINING_COMPLETED(NotificationKind.REQUEST),

    // Kind: CANCELLATION (red) — a decline or a cancellation
    BOOKING_REQUEST_DECLINED(NotificationKind.CANCELLATION),
    RESCHEDULE_REQUEST_REJECTED(NotificationKind.CANCELLATION),
    TRAINING_CANCELLED_BY_CLIENT(NotificationKind.CANCELLATION),
    TRAINING_CANCELLED_BY_TRAINER(NotificationKind.CANCELLATION),
    TRAINING_CONTRACT_EXCEEDED(NotificationKind.CANCELLATION);

    private final NotificationKind kind;

    NotificationType(NotificationKind kind) {
        this.kind = kind;
    }

    public NotificationKind getKind() {
        return kind;
    }

    public enum NotificationKind {
        NEW_CLIENT,
        REQUEST,
        CANCELLATION
    }
}
