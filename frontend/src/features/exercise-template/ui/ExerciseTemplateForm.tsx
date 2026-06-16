import { useState } from "react";
import FbTextField from "../../../shared/ui/FbTextField.tsx";
import { MUSCLE_GROUPS, muscleGroupLabel } from "../lib/muscleGroup.ts";
import type {
    CreateExerciseTemplateRequest,
    ExerciseTemplateResponse,
    MuscleGroup,
} from "../model/exerciseTemplate.types.ts";

type Props = {
    initial?: ExerciseTemplateResponse | null;
    isSubmitting: boolean;
    submitLabel: string;
    onSubmit: (payload: CreateExerciseTemplateRequest) => void;
};

function toNumberOrUndefined(value: string): number | undefined {
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
}

/** Seed the single "Повторы" field from the existing reps model. */
function initialReps(initial?: ExerciseTemplateResponse | null): string {
    if (!initial) return "";
    if (initial.repsMode === "EXACT" && initial.repsValue != null) {
        return String(initial.repsValue);
    }
    if (initial.repsMode === "RANGE" && initial.repsFrom != null) {
        return String(initial.repsFrom);
    }
    return "";
}

export default function ExerciseTemplateForm({
    initial,
    isSubmitting,
    submitLabel,
    onSubmit,
}: Props) {
    const [name, setName] = useState(initial?.name ?? "");
    const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(
        initial?.muscleGroup ?? null
    );
    const [description, setDescription] = useState(initial?.description ?? "");
    const [reps, setReps] = useState(initialReps(initial));
    const [duration, setDuration] = useState(
        initial?.durationSeconds != null ? String(initial.durationSeconds) : ""
    );
    const [weight, setWeight] = useState(
        initial?.weight != null ? String(initial.weight) : ""
    );
    const [sets, setSets] = useState(initial?.sets != null ? String(initial.sets) : "");
    const [rest, setRest] = useState(
        initial?.restSeconds != null ? String(initial.restSeconds) : ""
    );
    const [trainerNote, setTrainerNote] = useState(initial?.trainerNote ?? "");

    const [error, setError] = useState("");
    const [pickerOpen, setPickerOpen] = useState(false);

    const handleSubmit = () => {
        if (!name.trim()) {
            setError("Укажите название упражнения");
            return;
        }
        setError("");

        const repsValue = toNumberOrUndefined(reps);

        onSubmit({
            name: name.trim(),
            muscleGroup,
            description: description.trim() || undefined,
            repsMode: repsValue != null ? "EXACT" : "NONE",
            repsValue,
            durationSeconds: toNumberOrUndefined(duration),
            weight: toNumberOrUndefined(weight),
            sets: toNumberOrUndefined(sets),
            restSeconds: toNumberOrUndefined(rest),
            trainerNote: trainerNote.trim() || undefined,
        });
    };

    return (
        <div className="fb-body">
            <FbTextField
                id="ex-name"
                label="Название упражнения"
                value={name}
                onChange={setName}
                error={error || undefined}
            />

            <button
                type="button"
                className="fb-select"
                onClick={() => setPickerOpen(true)}
            >
                <span className="fb-select__label">Группа мышц</span>
                <span className="fb-select__control">
                    <span className={muscleGroup ? "fb-select__value" : "fb-select__placeholder"}>
                        {muscleGroup ? muscleGroupLabel(muscleGroup) : "Не выбрана"}
                    </span>
                    <span className="fb-select__chevron">›</span>
                </span>
            </button>

            <label className="fb-textarea">
                <span className="fb-textarea__label">Описание</span>
                <textarea
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />
            </label>

            <FbTextField id="ex-reps" label="Повторы" type="number" inputMode="numeric" value={reps} onChange={setReps} />
            <FbTextField id="ex-duration" label="Время, сек" type="number" inputMode="numeric" value={duration} onChange={setDuration} />
            <FbTextField id="ex-weight" label="Вес, кг" inputMode="decimal" value={weight} onChange={setWeight} />
            <FbTextField id="ex-sets" label="Подходы" type="number" inputMode="numeric" value={sets} onChange={setSets} />
            <FbTextField id="ex-rest" label="Время отдыха, сек" type="number" inputMode="numeric" value={rest} onChange={setRest} />

            <label className="fb-textarea">
                <span className="fb-textarea__label">Заметка тренера</span>
                <textarea
                    rows={3}
                    value={trainerNote}
                    onChange={(event) => setTrainerNote(event.target.value)}
                />
            </label>

            <button
                type="button"
                className="fb-btn fb-btn--primary fb-form-submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Сохраняем…" : submitLabel}
            </button>

            {pickerOpen && (
                <>
                    <button
                        type="button"
                        className="fb-sheet-backdrop"
                        aria-label="Закрыть"
                        onClick={() => setPickerOpen(false)}
                    />
                    <div className="fb-sheet" role="dialog" aria-label="Группа мышц">
                        <div className="fb-sheet__title">Группа мышц</div>
                        {MUSCLE_GROUPS.map((group) => {
                            const active = muscleGroup === group;
                            return (
                                <button
                                    key={group}
                                    type="button"
                                    className="fb-sheet__item"
                                    onClick={() => {
                                        setMuscleGroup(group);
                                        setPickerOpen(false);
                                    }}
                                >
                                    <span>{muscleGroupLabel(group)}</span>
                                    {active ? <span className="fb-sheet__check">✓</span> : null}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
