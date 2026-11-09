function normalize(_key: string, value: unknown): unknown {
    if (typeof value === "string") {
        return value.trim();
    }
    // Chips: the order they were tapped in doesn't matter.
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
        return [...value].sort();
    }
    return value;
}

/** FIT-85: the form differs from what it opened with (spaces don't count); until then its submit button is off. */
export function isFormChanged(current: object, initial: object): boolean {
    return JSON.stringify(current, normalize) !== JSON.stringify(initial, normalize);
}
