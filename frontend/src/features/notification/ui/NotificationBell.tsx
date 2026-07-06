import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BellIcon from "./BellIcon";
import { notificationApi } from "../../../shared/api/notificationApi";

type Props = {
    className?: string;
};

export default function NotificationBell({ className }: Props) {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        notificationApi
            .getUnreadCount()
            .then((data) => {
                if (!cancelled) {
                    setUnreadCount(data.count);
                }
            })
            .catch(() => {
                // Non-critical — the badge just won't show a number.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <button
            type="button"
            className={className ? `fb-notif-bell ${className}` : "fb-notif-bell"}
            aria-label="Уведомления"
            onClick={() => navigate("/notifications")}
        >
            <BellIcon className="fb-notif-bell__icon" />
            {unreadCount > 0 ? (
                <span className="fb-notif-bell__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            ) : null}
        </button>
    );
}
