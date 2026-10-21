import type {
    TrainingExerciseFieldPayload,
    TrainingExerciseResponse,
} from "../../training-exercise/model/trainingExercise.types";

export type CircuitFieldType = "TEXT" | "TIMER";

/** One "Текст" / "Секундомер" field of a station; `value` is the text or the mm:ss time. */
export type CircuitField = {
    key: string;
    type: CircuitFieldType;
    value: string;
};

/** One station of a circuit training: a name plus any number of fields added via "+". */
export type CircuitStation = {
    key: string;
    title: string;
    fields: CircuitField[];
};

function newKey(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newField(type: CircuitFieldType, value = ""): CircuitField {
    return { key: newKey("f"), type, value };
}

/** A new station shows one field of each type by default; more are added via "+". */
export function newStation(): CircuitStation {
    return { key: newKey("st"), title: "", fields: [newField("TEXT"), newField("TIMER")] };
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

/** A filled timer field with a time that can't be parsed. */
export function hasInvalidTimer(station: CircuitStation): boolean {
    return station.fields.some((f) => f.type === "TIMER" && f.value.trim() !== "" && parseTimer(f.value) === undefined);
}

/** Fields for the API; empty ones are skipped (the backend drops them too). */
export function stationFieldsPayload(station: CircuitStation): TrainingExerciseFieldPayload[] {
    const result: TrainingExerciseFieldPayload[] = [];
    for (const field of station.fields) {
        if (field.type === "TEXT" && field.value.trim()) {
            result.push({ type: "TEXT", text: field.value.trim() });
        }
        if (field.type === "TIMER" && parseTimer(field.value) !== undefined) {
            result.push({ type: "TIMER", seconds: parseTimer(field.value) });
        }
    }
    return result;
}

/**
 * Station fields of a saved exercise. Stations created before fields existed kept
 * the text in `description` and the timer in `durationSeconds`.
 */
export function exerciseFields(ex: TrainingExerciseResponse): { type: CircuitFieldType; text: string | null; seconds: number | null }[] {
    if (ex.fields && ex.fields.length > 0) {
        return ex.fields.map((f) => ({ type: f.type, text: f.text, seconds: f.seconds }));
    }
    const legacy: { type: CircuitFieldType; text: string | null; seconds: number | null }[] = [];
    if (ex.description) legacy.push({ type: "TEXT", text: ex.description, seconds: null });
    if (ex.durationSeconds != null) legacy.push({ type: "TIMER", text: null, seconds: ex.durationSeconds });
    return legacy;
}

export function stationFromExercise(ex: TrainingExerciseResponse): CircuitStation {
    return {
        key: `ex-${ex.id}`,
        title: ex.title,
        fields: exerciseFields(ex).map((f) =>
            f.type === "TEXT" ? newField("TEXT", f.text ?? "") : newField("TIMER", f.seconds != null ? formatTimer(f.seconds) : "")
        ),
    };
}
