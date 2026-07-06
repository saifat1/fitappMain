import { pushApi } from "../../../shared/api/pushApi";

function urlBase64ToUint8Array(base64String: string): BufferSource {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray.buffer as ArrayBuffer;
}

export function isPushSupported(): boolean {
    return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export function getPushPermission(): NotificationPermission | "unsupported" {
    if (!isPushSupported()) return "unsupported";
    return Notification.permission;
}

/**
 * Requests OS-level notification permission, subscribes this device to Web
 * Push, and registers the subscription with the backend. Returns false if
 * the browser doesn't support push, the user denies permission, or the
 * backend has no VAPID public key configured yet (PUSH_ENABLED=false).
 */
export async function enablePushNotifications(): Promise<boolean> {
    if (!isPushSupported()) return false;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const publicKey = await pushApi.getPublicKey();
    if (!publicKey) return false;

    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        return false;
    }

    await pushApi.subscribe({
        endpoint: json.endpoint,
        p256dhKey: json.keys.p256dh,
        authKey: json.keys.auth,
        userAgent: navigator.userAgent,
    });

    return true;
}

export async function disablePushNotifications(): Promise<void> {
    if (!isPushSupported()) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        await pushApi.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
    }
}
