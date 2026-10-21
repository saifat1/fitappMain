import { useState } from "react";
import FbTextField from "../../../shared/ui/FbTextField";
import { summaryFromParts, type DraftExercise } from "../model/trainingDraft";
import type { ExerciseTemplateResponse } from "../../exercise-template/model/exerciseTemplate.types";
import type {
    RepsMode,
    TrainingExerciseResponse,
    TrainingExerciseSetPayload,
    UpdateTrainingExerciseRequest,
} from "../../training-exercise/model/trainingExercise.types";

type Props = {
    /** When set, fields are seeded from this template and the title is fixed. */
    template?: ExerciseTemplateResponse | null;
    /** When set, the form edits this saved exercise and calls onSave instead of onAdd. */
    exercise?: TrainingExerciseResponse | null;
    onAdd?: (draft: DraftExercise) => void;
    onSave?: (payload: UpdateTrainingExerciseRequest) => Promise<void> | void;
    onBack?: () => void;
};

const MAX_SETS = 50;

type SetRow = {
    reps: string;
    weight: string;
    /** Edited by hand: no longer follows the common reps/weight fields. */
    touched: boolean;
};

type ParsedReps =
    | { mode: "NONE" }
    | { mode: "EXACT"; value: number }
    | { mode: "RANGE"; from: number; to: number };

function toNumber(value: string): number | undefined {
    const v = value.trim().replace(",", ".");
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}

/** "10" → exact, "8-12" → range, "" → none, anything else → null (invalid). */
function parseReps(value: string): ParsedReps | null {
    const v = value.trim();
    if (!v) return { mode: "NONE" };

    const range = v.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (range) {
        const from = Number(range[1]);
        const to = Number(range[2]);
        if (from < 1 || to < from) return null;
        return from === to ? { mode: "EXACT", value: from } : { mode: "RANGE", from, to };
    }

    if (/^\d+$/.test(v) && Number(v) >= 1) return { mode: "EXACT", value: Number(v) };
    return null;
}

function repsText(mode: RepsMode | undefined, value?: number | null, from?: number | null, to?: number | null): string {
    if (mode === "EXACT" && value != null) return String(value);
    if (mode === "RANGE" && from != null && to != null) return `${from}-${to}`;
    return "";
}

/** Reps a new set starts with: the exact value, or the lower bound of a range. */
function defaultSetReps(reps: string): string {
    const parsed = parseReps(reps);
    if (parsed?.mode === "EXACT") return String(parsed.value);
    if (parsed?.mode === "RANGE") return String(parsed.from);
    return "";
}

function setsCount(value: string): number {
    const n = Math.floor(toNumber(value) ?? 0);
    return Math.min(Math.max(n, 0), MAX_SETS);
}

function resizeRows(rows: SetRow[], count: number, reps: string, weight: string): SetRow[] {
    if (rows.length >= count) return rows.slice(0, count);
    const extra = Array.from({ length: count - rows.length }, () => ({
        reps: defaultSetReps(reps),
        weight,
        touched: false,
    }));
    return [...rows, ...extra];
}

function seed(template?: ExerciseTemplateResponse | null, exercise?: TrainingExerciseResponse | null) {
    const src = exercise ?? template;
    const reps = src ? repsText(src.repsMode, src.repsValue, src.repsFrom, src.repsTo) : "";
    const weight = src?.weight != null ? String(src.weight) : "";
    const sets = src?.sets != null ? String(src.sets) : "";

    const saved = exercise?.setDetails ?? [];
    const rows: SetRow[] = saved.length
        ? saved.map((s) => ({
              reps: s.reps != null ? String(s.reps) : "",
              weight: s.weight != null ? String(s.weight) : "",
              touched: true,
          }))
        : resizeRows([], setsCount(sets), reps, weight);

    return {
        title: exercise?.title ?? template?.name ?? "",
        description: src?.description ?? "",
        reps,
        duration: src?.durationSeconds != null ? String(src.durationSeconds) : "",
        weight,
        sets,
        rest: src?.restSeconds != null ? String(src.restSeconds) : "",
        trainerNote: src?.trainerNote ?? "",
        rows,
    };
}

export default function ExerciseDetailForm({ template, exercise, onAdd, onSave, onBack }: Props) {
    const isTemplate = Boolean(template);
    const isEdit = Boolean(exercise);

    const [initial] = useState(() => seed(template, exercise));
    const [title, setTitle] = useState(initial.title);
    const [description, setDescription] = useState(initial.description);
    const [reps, setReps] = useState(initial.reps);
    const [duration, setDuration] = useState(initial.duration);
    const [weight, setWeight] = useState(initial.weight);
    const [sets, setSets] = useState(initial.sets);
    const [rest, setRest] = useState(initial.rest);
    const [trainerNote, setTrainerNote] = useState(initial.trainerNote);
    const [rows, setRows] = useState<SetRow[]>(initial.rows);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const changeReps = (value: string) => {
        setReps(value);
        setRows((prev) => prev.map((r) => (r.touched ? r : { ...r, reps: defaultSetReps(value) })));
    };

    const changeWeight = (value: string) => {
        setWeight(value);
        setRows((prev) => prev.map((r) => (r.touched ? r : { ...r, weight: value })));
    };

    const changeSets = (value: string) => {
        setSets(value);
        setRows((prev) => resizeRows(prev, setsCount(value), reps, weight));
    };

    const changeRow = (index: number, patch: Partial<Pick<SetRow, "reps" | "weight">>) => {
        setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch, touched: true } : r)));
    };

    const handleSubmit = async () => {
        const finalTitle = (isTemplate ? template?.name : title)?.trim() ?? "";
        if (!finalTitle) {
            setError("Укажите название");
            return;
        }

        const parsedReps = parseReps(reps);
        if (!parsedReps) {
            setError("Повторы: число или диапазон, например 8-12");
            return;
        }

        const durationSeconds = toNumber(duration);
        const weightValue = toNumber(weight);
        const setsValue = setsCount(sets) || undefined;
        const restSeconds = toNumber(rest);

        const setDetails: TrainingExerciseSetPayload[] = setsValue
            ? rows.map((r) => ({ reps: toNumber(r.reps), weight: toNumber(r.weight) }))
            : [];

        if (setDetails.some((s) => s.reps != null && (!Number.isInteger(s.reps) || s.reps < 1))) {
            setError("Повторы в подходе — целое число больше 0");
            return;
        }
        if (setDetails.some((s) => s.weight != null && s.weight <= 0)) {
            setError("Вес в подходе должен быть больше 0");
            return;
        }

        setError("");

        const repsPayload = {
            repsMode: parsedReps.mode,
            repsValue: parsedReps.mode === "EXACT" ? parsedReps.value : undefined,
            repsFrom: parsedReps.mode === "RANGE" ? parsedReps.from : undefined,
            repsTo: parsedReps.mode === "RANGE" ? parsedReps.to : undefined,
        };

        if (isEdit) {
            setIsSaving(true);
            try {
                await onSave?.({
                    title: finalTitle,
                    // Empty strings clear text fields on the backend; numbers can only be changed.
                    description: description.trim(),
                    ...repsPayload,
                    durationSeconds,
                    weight: weightValue,
                    sets: setsValue,
                    restSeconds,
                    trainerNote: trainerNote.trim(),
                    setDetails,
                });
            } catch (e) {
                setError(e instanceof Error ? e.message : "Не удалось сохранить упражнение");
            } finally {
                setIsSaving(false);
            }
            return;
        }

        onAdd?.({
            key: `ex-${Date.now()}`,
            title: finalTitle,
            summary: summaryFromParts({
                repsDisplay: reps.trim() || null,
                durationSeconds,
                weight: weightValue,
                sets: setsValue,
            }),
            source: {
                kind: "custom",
                payload: {
                    title: finalTitle,
                    description: description.trim() || undefined,
                    ...repsPayload,
                    durationSeconds,
                    weight: weightValue,
                    sets: setsValue,
                    restSeconds,
                    trainerNote: trainerNote.trim() || undefined,
                    setDetails: setsValue ? setDetails : undefined,
                },
            },
        });
    };

    return (
        <div className="fb-sheet__scroll fb-pad">
            {isTemplate ? (
                <div className="fb-detail-head">
                    {onBack && (
                        <button type="button" className="fb-detail-head__back" aria-label="Назад" onClick={onBack}>
                            ‹
                        </button>
                    )}
                    <span className="fb-detail-head__title">{template?.name}</span>
                </div>
            ) : (
                <FbTextField id="ex-title" label="Название упражнения" value={title} onChange={setTitle} />
            )}

            <label className="fb-textarea">
                <span className="fb-textarea__label">Описание</span>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <FbTextField id="ex-reps" label="Повторы" placeholder="10 или 8-12" value={reps} onChange={changeReps} />
            <FbTextField id="ex-time" label="Время, сек" type="number" inputMode="numeric" value={duration} onChange={setDuration} />
            <FbTextField id="ex-weight" label="Вес, кг" inputMode="decimal" value={weight} onChange={changeWeight} />
            <FbTextField id="ex-sets" label="Подходы" type="number" inputMode="numeric" min={0} max={MAX_SETS} value={sets} onChange={changeSets} />

            {rows.length > 0 && (
                <div className="fb-sets">
                    <div className="fb-sets__head">
                        <span>Подход</span>
                        <span>Повторы</span>
                        <span>Вес, кг</span>
                    </div>
                    {rows.map((row, index) => (
                        <div key={index} className="fb-sets__row">
                            <span className="fb-sets__num">{index + 1}</span>
                            <input
                                className="fb-sets__input"
                                type="number"
                                inputMode="numeric"
                                aria-label={`Повторы, подход ${index + 1}`}
                                value={row.reps}
                                onChange={(e) => changeRow(index, { reps: e.target.value })}
                            />
                            <input
                                className="fb-sets__input"
                                inputMode="decimal"
                                aria-label={`Вес, подход ${index + 1}`}
                                value={row.weight}
                                onChange={(e) => changeRow(index, { weight: e.target.value })}
                            />
                        </div>
                    ))}
                </div>
            )}

            <FbTextField id="ex-rest" label="Время отдыха, сек" type="number" inputMode="numeric" value={rest} onChange={setRest} />

            <label className="fb-textarea">
                <span className="fb-textarea__label">Заметка тренера</span>
                <textarea rows={2} value={trainerNote} onChange={(e) => setTrainerNote(e.target.value)} />
            </label>

            {error ? <div className="fb-cal-error">{error}</div> : null}

            <button
                type="button"
                className="fb-btn fb-btn--primary fb-form-submit"
                onClick={() => void handleSubmit()}
                disabled={isSaving}
            >
                {isEdit ? (isSaving ? "Сохраняем…" : "Сохранить") : "Добавить"}
            </button>
        </div>
    );
}
