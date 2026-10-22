import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { pushApi } from "../../../shared/api/pushApi";
import { isNativeApp } from "../../../shared/lib/platform";

/**
 * Store app push via Firebase Cloud Messaging (FIT-69). The browser / PWA keeps using Web Push (pushRegistration.ts).
 * The channel id must match the one the backend sends (FcmPushService).
 */
export const ANDROID_CHANNEL_ID = "fitapp_default";
const DEVICE_TOKEN_KEY = "fitapp_device_push_token";

let listenersReady = false;

function platform(): "ANDROID" | "IOS" {
    return Capacitor.getPlatform() === "ios" ? "IOS" : "ANDROID";
}

async function setUpListeners(): Promise<void> {
    if (listenersReady) return;
    listenersReady = true;

    await PushNotifications.addListener("registration", (token) => {
        try {
            localStorage.setItem(DEVICE_TOKEN_KEY, token.value);
        } catch {
            /* storage may be unavailable — the token is still sent */
        }
        void pushApi.registerDevice(token.value, platform()).catch(() => undefined);
    });

    // Tap on a notification: open the in-app list, where the notification links to its training / request.
    await PushNotifications.addListener("pushNotificationActionPerformed", () => {
        window.location.assign("/notifications");
    });

    if (platform() === "ANDROID") {
        await PushNotifications.createChannel({
            id: ANDROID_CHANNEL_ID,
            name: "Тренировки и заявки",
            description: "Новые тренировки, переносы и заявки на запись",
            importance: 4,
            visibility: 1,
        }).catch(() => undefined);
    }
}

/** After sign-in: asks for permission once (Android 13+ shows the system dialog) and sends the device token. */
export async function registerNativePush(): Promise<void> {
    if (!isNativeApp) return;

    try {
        await setUpListeners();

        let permission = await PushNotifications.checkPermissions();
        if (permission.receive === "prompt" || permission.receive === "prompt-with-rationale") {
            permission = await PushNotifications.requestPermissions();
        }
        if (permission.receive !== "granted") return;

        await PushNotifications.register();
    } catch {
        /* push is optional — the app works without it */
    }
}

/** On logout: the next user of this phone must not get the previous user's notifications. */
export function unregisterNativePush(): void {
    if (!isNativeApp) return;

    let token: string | null = null;
    try {
        token = localStorage.getItem(DEVICE_TOKEN_KEY);
        localStorage.removeItem(DEVICE_TOKEN_KEY);
    } catch {
        /* nothing stored */
    }
    if (token) {
        void pushApi.removeDevice(token, platform()).catch(() => undefined);
    }
}
