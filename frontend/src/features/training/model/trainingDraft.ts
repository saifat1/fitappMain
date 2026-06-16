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
