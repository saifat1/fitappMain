export type NotificationKind = "NEW_CLIENT" | "REQUEST" | "CANCELLATION";

export type NotificationTypeCode =
    | "NEW_CLIENT"
    | "BOOKING_REQUEST_CREATED"
    | "BOOKING_REQUEST_APPROVED"
    | "BOOKING_REQUEST_DECLINED"
    | "RESCHEDULE_REQUEST_CREATED"
    | "RESCHEDULE_REQUEST_APPROVED"
    | "RESCHEDULE_REQUEST_REJECTED"
    | "TRAINING_CANCELLED_BY_CLIENT"
    | "TRAINING_CANCELLED_BY_TRAINER"
    | "TRAINING_COMPLETED";

export type NotificationResponse = {
    id: number;
    type: NotificationTypeCode;
    kind: NotificationKind;
    title: string;
    body: string | null;
    relatedEntityType: string | null;
    relatedEntityId: number | null;
    actorId: number | null;
    actorName: string | null;
    read: boolean;
    createdAt: string;
};

export type UnreadCountResponse = {
    count: number;
};
