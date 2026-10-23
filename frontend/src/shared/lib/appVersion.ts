import { Capacitor } from "@capacitor/core";

declare const __APP_VERSION__: string;
declare const __BUILD_COMMIT__: string;
declare const __BUILD_TIME__: string;

/** FIT-74: version of this build — the store app keeps the one it was built with, the site gets each release. */
export const APP_VERSION = __APP_VERSION__;
export const BUILD_COMMIT = __BUILD_COMMIT__;
export const BUILD_TIME = __BUILD_TIME__;

export function platformLabel(): string {
    switch (Capacitor.getPlatform()) {
        case "android":
            return "Android-приложение";
        case "ios":
            return "iOS-приложение";
        default:
            return "сайт";
    }
}

export function formatBuildDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
        ? iso
        : date.toLocaleString("ru-RU", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
