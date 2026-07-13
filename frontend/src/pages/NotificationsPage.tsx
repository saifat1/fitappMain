import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../shared/api/notificationApi";
import NotificationRow from "../features/notification/ui/NotificationRow";
import NotificationActionSheet from "../features/notification/ui/NotificationActionSheet";
import PushPermissionBanner from "../features/push/ui/PushPermissionBanner";
import MobileShell from "../widgets/MobileShell";
import BackArrowIcon from "../shared/ui/BackArrowIcon";
import type { NotificationResponse } from "../features/notification/model/notification.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import axios from "axios";

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [activeNotification, setActiveNotification] = useState<NotificationResponse | null>(null);

    const handleBack = () => {
        // window.history.length is 1 on a fresh tab (e.g. opened straight from
        // a push notification) — there's nothing to go back to in that case.
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/me");
        }
    };

    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await notificationApi.getMyNotifications();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            const message = axios.isAxiosError<ApiErrorResponse>(error)
                ? error.response?.data?.message
                : undefined;
            setErrorMessage(message ?? "Не удалось загрузить уведомления");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const markAsRead = async (notification: NotificationResponse) => {
        if (notification.read) return;

        try {
            await notificationApi.markAsRead(notification.id);
            setNotifications((prev) =>
                prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
            );
        } catch {
            // Read-state sync failing silently is fine — the list still works.
        }
    };

    const handleRowClick = (notification: NotificationResponse) => {
        void markAsRead(notification);

        if (notification.type === "NEW_CLIENT") {
            // No approve/decline step here — clients auto-link to the trainer
            // via the invite link at registration, there's nothing to accept
            // or reject (yet — see the 06.07.2026 note in NotificationService).
            // Tapping just opens that client's profile.
            navigate(
                notification.relatedEntityId
                    ? `/trainer/clients/${notification.relatedEntityId}`
                    : "/trainer/clients"
            );
            return;
        }

        if (notification.type === "CONTRACT_EXPIRING") {
            // relatedEntityId is the contract itself — actorId is the client
            // it belongs to, which is what's actually navigable.
            navigate(notification.actorId ? `/trainer/clients/${notification.actorId}` : "/trainer/clients");
            return;
        }

        setActiveNotification(notification);
    };

    const handleSheetResolved = () => {
        if (activeNotification) {
            setNotifications((prev) =>
                prev.map((item) => (item.id === activeNotification.id ? { ...item, read: true } : item))
            );
        }
        setActiveNotification(null);
        void load();
    };

    return (
        <MobileShell
            title="Уведомления"
            left={
                <button type="button" className="fb-topbar__back" onClick={handleBack} aria-label="Назад">
                    <BackArrowIcon />
                </button>
            }
            showTabBar={false}
            contentClassName="fb-notif-page"
        >
            <PushPermissionBanner />

            {isLoading ? (
                <div className="fb-cal-status">Загрузка…</div>
            ) : errorMessage ? (
                <div className="fb-cal-error">{errorMessage}</div>
            ) : notifications.length === 0 ? (
                <div className="fb-notif-empty">Пока нет уведомлений</div>
            ) : (
                <div className="fb-notif-list">
                    {notifications.map((notification) => (
                        <NotificationRow
                            key={notification.id}
                            notification={notification}
                            onClick={handleRowClick}
                        />
                    ))}
                </div>
            )}

            {activeNotification ? (
                <NotificationActionSheet
                    notification={activeNotification}
                    onClose={() => setActiveNotification(null)}
                    onResolved={handleSheetResolved}
                />
            ) : null}
        </MobileShell>
    );
}
