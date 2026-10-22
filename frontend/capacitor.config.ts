import type { CapacitorConfig } from "@capacitor/cli";

// Store app (FIT-68): the same React build (dist/) packed into Android / iOS. API calls go to https://fitapp.com.ru
// (see src/shared/lib/platform.ts); the page itself is served from https://localhost inside the app.
const config: CapacitorConfig = {
    appId: "ru.com.fitapp",
    appName: "FitApp",
    webDir: "dist",
    android: {
        // HTTP is never used: the app talks only to the HTTPS API.
        allowMixedContent: false,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 800,
            backgroundColor: "#34a853",
            showSpinner: false,
        },
    },
};

export default config;
