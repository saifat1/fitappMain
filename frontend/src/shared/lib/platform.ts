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
