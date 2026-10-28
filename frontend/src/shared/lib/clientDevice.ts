const KEY = "fitapp_client_device";

/**
 * FIT-83: this browser / phone belongs to a client — a client signed in here or changed the password by the
 * trainer's link. Then the start screen and «Назад» on the login page don't lead to the trainer registration.
 * A trainer signing in here clears the mark. Storage errors are ignored (private mode — nothing is hidden).
 */
export function isClientDevice(): boolean {
    try {
        return localStorage.getItem(KEY) === "1";
    } catch {
        return false;
    }
}

export function setClientDevice(isClient: boolean): void {
    try {
        if (isClient) localStorage.setItem(KEY, "1");
        else localStorage.removeItem(KEY);
    } catch {
        /* private mode */
    }
}
