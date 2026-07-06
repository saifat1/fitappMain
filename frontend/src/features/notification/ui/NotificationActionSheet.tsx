import { useState } from "react";
import { bookingRequestApi } from "../../../shared/api/bookingRequestApi";
import { rescheduleApi } from "../../../shared/api/rescheduleApi";
import { formatNotificationTimeLabel } from "../lib/notificationDisplay";
import type { NotificationResponse } from "../model/notification.types";

type Props = {
    notification: NotificationResponse;
    onClose: () => void;
    onResolved: () => void;
};

/**
 * Matches the two bottom-sheet variants from the "Колокольчик" Figma page:
 * actionable requests get a green "Подтвердить" + outlined "Отклонить" pair
 * (Button/Double); everything already resolved gets a single outlined
 * "Понятно" acknowledgement (Button/Long).
 */
export default function NotificationActionSheet({ notification, onClose, onResolved }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isActionable =
        notification.type === "BOOKING_REQUEST_CREATED" ||
        notification.type === "RESCHEDULE_REQUEST_CREATED";

    const handleApprove = async () => {
        if (!notification.relatedEntityId) return;
        setIsSaving(true);
        setErrorMessage("");

        try {
            if (notification.type === "BOOKING_REQUEST_CREATED") {
                await bookingRequestApi.approveBookingRequest(notification.relatedEntityId, {});
            } else if (notification.type === "RESCHEDULE_REQUEST_CREATED") {
                await rescheduleApi.processRequest(notification.relatedEntityId, {
                    decision: "APPROVED",
                });
            }
            onResolved();
        } catch {
            setErrorMessage("Не удалось выполнить действие. Попробуйте ещё раз");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDecline = async () => {
        if (!notification.relatedEntityId) return;
        setIsSaving(true);
        setErrorMessage("");

        try {
            if (notification.type === "BOOKING_REQUEST_CREATED") {
                await bookingRequestApi.declineBookingRequest(notification.relatedEntityId, {});
            } else if (notification.type === "RESCHEDULE_REQUEST_CREATED") {
                await rescheduleApi.processRequest(notification.relatedEntityId, {
                    decision: "REJECTED",
                });
            }
            onResolved();
        } catch {
            setErrorMessage("Не удалось выполнить действие. Попробуйте ещё раз");
        } finally {
            setIsSaving(false);
        }
    };

    const subtitle = notification.actorName
        ? `От ${notification.actorName}${notification.body ? `, ${notification.body}` : ""}`
        : formatNotificationTimeLabel(notification.createdAt);

    return (
        <>
            <button type="button" className="fb-overlay" aria-label="Закрыть" onClick={onClose} />

            <div className="fb-notif-sheet" role="dialog" aria-label={notification.title}>
                <div className="fb-notif-sheet__handle" />

                <div className="fb-notif-sheet__text">
                    <h3 className="fb-notif-sheet__title">{notification.title}</h3>
                    <p className="fb-notif-sheet__subtitle">{subtitle}</p>
                </div>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                <div className="fb-notif-sheet__actions">
                    {isActionable ? (
                        <>
                            <button
                                type="button"
                                className="fb-btn fb-btn--primary"
                                onClick={handleApprove}
                                disabled={isSaving}
                            >
                                Подтвердить
                            </button>
                            <button
                                type="button"
                                className="fb-btn fb-btn--ghost"
                                onClick={handleDecline}
                                disabled={isSaving}
                            >
                                Отклонить
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="fb-btn fb-btn--ghost"
                            onClick={onResolved}
                            disabled={isSaving}
                        >
                            Понятно
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
