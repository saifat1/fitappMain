import NotificationIcon from "./NotificationIcon";
import { formatNotificationTimeLabel } from "../lib/notificationDisplay";
import type { NotificationResponse } from "../model/notification.types";

type Props = {
    notification: NotificationResponse;
    onClick: (notification: NotificationResponse) => void;
};

export default function NotificationRow({ notification, onClick }: Props) {
    const subtitle = notification.actorName
        ? `От ${notification.actorName}${notification.body ? `, ${notification.body}` : ""}`
        : notification.body ?? "";

    return (
        <button
            type="button"
            className="fb-notif-row"
            onClick={() => onClick(notification)}
        >
            <NotificationIcon kind={notification.kind} />

            <span className="fb-notif-row__body">
                <span className="fb-notif-row__top">
                    <span className="fb-notif-row__title">
                        {!notification.read && <span className="fb-notif-row__dot" />}
                        {notification.title}
                    </span>
                    <span className="fb-notif-row__time">
                        {formatNotificationTimeLabel(notification.createdAt)}
                    </span>
                </span>

                {subtitle ? <span className="fb-notif-row__subtitle">{subtitle}</span> : null}
            </span>
        </button>
    );
}
