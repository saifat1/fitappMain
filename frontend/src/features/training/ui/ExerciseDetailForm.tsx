import { useState } from "react";
import FbTextField from "../../../shared/ui/FbTextField";
import { summaryFromParts, type DraftExercise } from "../model/trainingDraft";
import type { ExerciseTemplateResponse } from "../../exercise-template/model/exerciseTemplate.types";

type Props = {
    /** When set, fields are seeded from this template and the title is fixed. */
    template?: ExerciseTemplateResponse | null;
    onAdd: (draft: DraftExercise) => void;
    onBack?: () => void;
};

function toNumber(value: string): number | undefined {
    const v = value.trim().replace(",", ".");
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
}

function seedReps(template?: ExerciseTemplateResponse | null): string {
    if (!template) return "";
    if (template.repsMode === "EXACT" && template.repsValue != null) return String(template.repsValue);
    if (template.repsMode === "RANGE" && template.repsFrom != null) return String(template.repsFrom);
    return "";
}

export default function ExerciseDetailForm({ template, onAdd, onBack }: Props) {
    const isTemplate = Boolean(template);

    const [title, setTitle] = useState(template?.name ?? "");
    const [description, setDescription] = useState(template?.description ?? "");
    const [reps, setReps] = useState(seedReps(template));
    const [duration, setDuration] = useState(
        template?.durationSeconds != null ? String(template.durationSeconds) : ""
    );
    const [weight, setWeight] = useState(template?.weight != null ? String(template.weight) : "");
    const [sets, setSets] = useState(template?.sets != null ? String(template.sets) : "");
    const [rest, setRest] = useState(
        template?.restSeconds != null ? String(template.restSeconds) : ""
    );
    const [trainerNote, setTrainerNote] = useState(template?.trainerNote ?? "");
    const [error, setError] = useState("");

    const handleAdd = () => {
        const finalTitle = (isTemplate ? template?.name : title)?.trim() ?? "";
        if (!finalTitle) {
            setError("Укажите название");
            return;
        }

        const repsValue = toNumber(reps);
        const durationSeconds = toNumber(duration);
        const weightValue = toNumber(weight);
        const setsValue = toNumber(sets);
        const restSeconds = toNumber(rest);

        onAdd({
            key: `ex-${Date.now()}`,
            title: finalTitle,
            summary: summaryFromParts({
                repsDisplay: repsValue != null ? String(repsValue) : null,
                durationSeconds,
                weight: weightValue,
                sets: setsValue,
            }),
            source: {
                kind: "custom",
                payload: {
                    title: finalTitle,
                    description: description.trim() || undefined,
                    repsMode: repsValue != null ? "EXACT" : "NONE",
                    repsValue,
                    durationSeconds,
                    weight: weightValue,
                    sets: setsValue,
                    restSeconds,
                    trainerNote: trainerNote.trim() || undefined,
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
                <FbTextField id="ex-title" label="Название упражнения" value={title} onChange={setTitle} error={error || undefined} />
            )}

            <label className="fb-textarea">
                <span className="fb-textarea__label">Описание</span>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <FbTextField id="ex-reps" label="Повторы" type="number" inputMode="numeric" value={reps} onChange={setReps} />
            <FbTextField id="ex-time" label="Время, сек" type="number" inputMode="numeric" value={duration} onChange={setDuration} />
            <FbTextField id="ex-weight" label="Вес, кг" inputMode="decimal" value={weight} onChange={setWeight} />
            <FbTextField id="ex-sets" label="Подходы" type="number" inputMode="numeric" value={sets} onChange={setSets} />
            <FbTextField id="ex-rest" label="Время отдыха, сек" type="number" inputMode="numeric" value={rest} onChange={setRest} />

            <label className="fb-textarea">
                <span className="fb-textarea__label">Заметка тренера</span>
                <textarea rows={2} value={trainerNote} onChange={(e) => setTrainerNote(e.target.value)} />
            </label>

            {isTemplate && error ? <div className="fb-cal-error">{error}</div> : null}

            <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={handleAdd}>
                Добавить
            </button>
        </div>
    );
}
