import { Capacitor } from "@capacitor/core";

/** True inside the Android / iOS store app (Capacitor), false in the browser and the PWA. */
export const isNativeApp = Capacitor.isNativePlatform();

/**
 * The public site. Inside the store app the page itself is served from https://localhost,
 * so links shown to the user and API calls must point at the real server.
 */
export const PUBLIC_SITE_URL = isNativeApp ? "https://fitapp.com.ru" : window.location.origin;

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

/** A relative VITE_API_BASE_URL (/api) only works in the browser; the store app needs the absolute address. */
export const API_BASE_URL =
    isNativeApp && !configuredApiBaseUrl?.startsWith("http")
        ? `${PUBLIC_SITE_URL}/api`
        : configuredApiBaseUrl ?? "/api";

/**
 * Which store the app build is for (VITE_APP_STORE at build time, default rustore); null on the site.
 * Google Play forbids selling the subscription in the app with anything but Google's own billing (unavailable in Russia),
 * and even pointing to another way to pay — so its build shows the subscription but sells nothing. Paying is on the site.
 */
export const APP_STORE: "rustore" | "google" | null = isNativeApp
    ? import.meta.env.VITE_APP_STORE === "google" ? "google" : "rustore"
    : null;

export const canBuyInApp = APP_STORE !== "google";
