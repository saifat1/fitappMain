import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "react-day-picker/style.css";
import "./index.css";
import "./styles/coach-calendar.css";
import "./styles/fitapp-theme.css";
import "./styles/fitapp-calendar.css";
import "./styles/fitapp-mobile.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
// Register the PWA service worker in production builds only.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
            /* PWA is progressive enhancement; ignore registration failures */
        });
    });
}
