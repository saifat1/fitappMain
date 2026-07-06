import { useEffect, useState } from "react";
import { enablePushNotifications, getPushPermission } from "../lib/pushRegistration";

export default function PushPermissionBanner() {
    const [status, setStatus] = useState<NotificationPermission | "unsupported">("default");
    const [isRequesting, setIsRequesting] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setStatus(getPushPermission());
    }, []);

    if (dismissed || status === "unsupported" || status === "granted" || status === "denied") {
        return null;
    }

    const handleEnable = async () => {
        setIsRequesting(true);
        try {
            const enabled = await enablePushNotifications();
            setStatus(enabled ? "granted" : getPushPermission());
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <div className="fb-push-banner">
            <span className="fb-push-banner__text">
                Включите уведомления, чтобы не пропускать заявки и переносы тренировок
            </span>
            <div className="fb-push-banner__actions">
                <button
                    type="button"
                    className="fb-btn fb-btn--primary fb-push-banner__btn"
                    onClick={handleEnable}
                    disabled={isRequesting}
                >
                    {isRequesting ? "Включаем…" : "Включить"}
                </button>
                <button
                    type="button"
                    className="fb-btn fb-btn--ghost fb-push-banner__btn"
                    onClick={() => setDismissed(true)}
                >
                    Не сейчас
                </button>
            </div>
        </div>
    );
}
