import type { CreateTrainingExerciseRequest } from "../../training-exercise/model/trainingExercise.types";
import type { ExerciseTemplateResponse } from "../../exercise-template/model/exerciseTemplate.types";

/** An exercise queued to be attached to a training once it is created. */
export type DraftExercise = {
    key: string;
    title: string;
    summary: string;
    source:
        | { kind: "template"; templateId: number }
        | { kind: "custom"; payload: CreateTrainingExerciseRequest };
};

export function summaryFromParts(parts: {
    repsDisplay?: string | null;
    durationSeconds?: number | null;
    weight?: number | null;
    sets?: number | null;
}): string {
    const chunks: string[] = [];
    if (parts.repsDisplay && parts.repsDisplay !== "—") chunks.push(`${parts.repsDisplay} повт.`);
    if (parts.durationSeconds != null) chunks.push(`${parts.durationSeconds} сек`);
    if (parts.weight != null) chunks.push(`${parts.weight} кг`);
    if (parts.sets != null) chunks.push(`${parts.sets} подх.`);
    return chunks.length ? chunks.join(" · ") : "Без параметров";
}

/**
 * "12×40 · 10×45 · 8×50" when sets differ from each other; null when there are no
 * per-set values or every set repeats the same reps/weight (the common summary is enough).
 */
export function setsBreakdown(
    sets: { reps?: number | null; weight?: number | null }[] | null | undefined
): string | null {
    if (!sets || sets.length === 0) return null;
    const first = sets[0];
    const allSame = sets.every((s) => (s.reps ?? null) === (first.reps ?? null) && (s.weight ?? null) === (first.weight ?? null));
    if (allSame) return null;

    return sets
        .map((s) => {
            const reps = s.reps != null ? String(s.reps) : "—";
            return s.weight != null ? `${reps}×${s.weight}` : reps;
        })
        .join(" · ");
}

export function draftFromTemplate(template: ExerciseTemplateResponse): DraftExercise {
    return {
        key: `tpl-${template.id}-${Date.now()}`,
        title: template.name,
        summary: summaryFromParts({
            repsDisplay: template.repsMode !== "NONE" ? template.repsDisplay : null,
            durationSeconds: template.durationSeconds,
            weight: template.weight,
            sets: template.sets,
        }),
        source: { kind: "template", templateId: template.id },
    };
}
