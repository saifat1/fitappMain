import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNativeApp } from "./platform";

/**
 * Store app only (FIT-68): the Android back button walks the app's history and closes the app on the first screen;
 * the status bar is white with dark icons, like the app's top bar.
 */
export function initNativeShell(): void {
    if (!isNativeApp) return;

    void App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
            window.history.back();
        } else {
            void App.exitApp();
        }
    });

    StatusBar.setOverlaysWebView({ overlay: false })
        .then(() => StatusBar.setBackgroundColor({ color: "#ffffff" }))
        .then(() => StatusBar.setStyle({ style: Style.Light }))
        .catch(() => {
            /* not supported on every OS version — the default status bar is fine */
        });
}
