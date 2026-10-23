import { isNativeApp } from "./platform";

const KEY = "fitapp_signup_source";

/**
 * FIT-72: remembers where the visitor first came from (?utm_source= or ?src= of the first visit), so the trainer
 * registration can report it. The first value wins; storage errors are ignored.
 */
export function rememberSignupSource(): void {
    try {
        if (localStorage.getItem(KEY)) return;
        const params = new URLSearchParams(window.location.search);
        const source = params.get("utm_source") ?? params.get("src");
        if (source) {
            localStorage.setItem(KEY, source.slice(0, 64));
        }
    } catch {
        /* private mode — the source just stays unknown */
    }
}

/** Source to send on registration: the remembered one, otherwise the store app or the site itself. */
export function signupSource(): string {
    try {
        const stored = localStorage.getItem(KEY);
        if (stored) return stored;
    } catch {
        /* fall through */
    }
    return isNativeApp ? "android_app" : "site";
}
