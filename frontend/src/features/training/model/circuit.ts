import type {
    CreateTrainingExerciseRequest,
    TrainingExerciseResponse,
    UpdateTrainingExerciseRequest,
} from "../../training-exercise/model/trainingExercise.types";

/** One exercise of a circuit training; everything except the title is optional. Values are raw input strings. */
export type CircuitStation = {
    key: string;
    title: string;
    description: string;
    /** kg, "12" / "12,5". */
    weight: string;
    /** mm:ss or seconds — the exercise timer. */
    time: string;
    reps: string;
};

function newKey(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newStation(): CircuitStation {
    return { key: newKey("st"), title: "", description: "", weight: "", time: "", reps: "" };
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

function parseWeight(value: string): number | undefined {
    const v = value.trim().replace(",", ".");
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined;
}

function parseReps(value: string): number | undefined {
    const v = value.trim();
    return /^\d+$/.test(v) && Number(v) > 0 ? Number(v) : undefined;
}

/** Validation of the training's "Количество кругов" / "Отдых после круга" inputs. */
export function circuitRoundsError(rounds: string, rest: string): string | null {
    const r = rounds.trim();
    if (r && !(/^\d+$/.test(r) && Number(r) >= 1 && Number(r) <= 50)) {
        return "Количество кругов: укажите число от 1 до 50";
    }
    if (rest.trim() && (parseTimer(rest) === undefined || (parseTimer(rest) ?? 0) > 3600)) {
        return "Отдых после круга: укажите время в формате мм:сс, не больше 60:00";
    }
    return null;
}

/** First validation problem of a station, or null. */
export function stationError(station: CircuitStation): string | null {
    if (!station.title.trim()) return "У каждого упражнения должно быть название";
    if (station.time.trim() && parseTimer(station.time) === undefined) {
        return "Время: укажите в формате мм:сс, например 0:45";
    }
    if (station.weight.trim() && parseWeight(station.weight) === undefined) {
        return "Вес: укажите число больше 0, например 12,5";
    }
    if (station.reps.trim() && parseReps(station.reps) === undefined) {
        return "Повторения: укажите целое число больше 0";
    }
    return null;
}

export function stationCreatePayload(station: CircuitStation): CreateTrainingExerciseRequest {
    const reps = parseReps(station.reps);
    return {
        title: station.title.trim(),
        description: station.description.trim() || undefined,
        weight: parseWeight(station.weight),
        durationSeconds: parseTimer(station.time),
        repsMode: reps !== undefined ? "EXACT" : "NONE",
        repsValue: reps,
    };
}

/** Full overwrite of a saved station: empty inputs clear the values; legacy text/timer fields are dropped. */
export function stationUpdatePayload(station: CircuitStation): UpdateTrainingExerciseRequest {
    const create = stationCreatePayload(station);
    return {
        ...create,
        description: create.description ?? "",
        clearWeight: create.weight === undefined,
        clearDuration: create.durationSeconds === undefined,
        fields: [],
    };
}

/**
 * Text and timer of a station saved in the earlier "+ поле" format (FIT-10, first iteration);
 * used as a fallback when the exercise's own description/duration are empty.
 */
function legacyFields(ex: TrainingExerciseResponse): { text: string | null; seconds: number | null } {
    const fields = ex.fields ?? [];
    const texts = fields.filter((f) => f.type === "TEXT" && f.text).map((f) => f.text as string);
    const timer = fields.find((f) => f.type === "TIMER" && f.seconds != null);
    return { text: texts.length ? texts.join("\n") : null, seconds: timer?.seconds ?? null };
}

export function stationDescription(ex: TrainingExerciseResponse): string | null {
    return ex.description || legacyFields(ex).text;
}

export function stationSeconds(ex: TrainingExerciseResponse): number | null {
    return ex.durationSeconds ?? legacyFields(ex).seconds;
}

/** "15 повт. · 12 кг · 0:45" — the exercise's parameters, empty string if none are set. */
export function stationParams(ex: TrainingExerciseResponse): string {
    const parts: string[] = [];
    if (ex.repsMode === "EXACT" && ex.repsValue != null) parts.push(`${ex.repsValue} повт.`);
    if (ex.repsMode === "RANGE" && ex.repsFrom != null && ex.repsTo != null) parts.push(`${ex.repsFrom}–${ex.repsTo} повт.`);
    if (ex.weight != null) parts.push(`${String(ex.weight).replace(".", ",")} кг`);
    const seconds = stationSeconds(ex);
    if (seconds != null) parts.push(formatTimer(seconds));
    return parts.join(" · ");
}

export function stationFromExercise(ex: TrainingExerciseResponse): CircuitStation {
    const seconds = stationSeconds(ex);
    return {
        key: `ex-${ex.id}`,
        title: ex.title,
        description: stationDescription(ex) ?? "",
        weight: ex.weight != null ? String(ex.weight).replace(".", ",") : "",
        time: seconds != null ? formatTimer(seconds) : "",
        reps: ex.repsMode === "EXACT" && ex.repsValue != null ? String(ex.repsValue) : "",
    };
}
