import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isNativeApp } from "./shared/lib/platform";
import { initNativeShell } from "./shared/lib/nativeShell";
import { rememberSignupSource } from "./shared/lib/signupSource";
import "react-day-picker/style.css";
import "./index.css";
import "./styles/fitapp-theme.css";
import "./styles/fitapp-calendar.css";
import "./styles/fitapp-mobile.css";
import "./styles/fitapp-notifications.css";

initNativeShell();
rememberSignupSource();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
// Register the PWA service worker in production builds only; the store app ships its files itself.
if (import.meta.env.PROD && !isNativeApp && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
            /* PWA is progressive enhancement; ignore registration failures */
        });
    });
}
