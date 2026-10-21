/** One station of a circuit training: a name plus optional "Текст" / "Секундомер" fields added via "+". */
export type CircuitStation = {
    key: string;
    title: string;
    /** null — field not added. */
    text: string | null;
    /** mm:ss; null — field not added. */
    timer: string | null;
};

export function newStation(): CircuitStation {
    return { key: `st-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: "", text: null, timer: null };
}

/** "1:30" / "90" → 90 seconds; empty or invalid → undefined. */
export function parseTimer(value: string | null): number | undefined {
    if (!value) return undefined;
    const v = value.trim();
    const mmss = v.match(/^(\d{1,3}):([0-5]\d)$/);
    if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]) || undefined;
    if (/^\d+$/.test(v)) return Number(v) || undefined;
    return undefined;
}

/** 90 → "1:30". */
export function formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
}
