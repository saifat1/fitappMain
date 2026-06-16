import type { MuscleGroup } from "../model/exerciseTemplate.types";

export const MUSCLE_GROUPS: MuscleGroup[] = ["CHEST", "BACK", "LEGS", "ABS"];

export const MUSCLE_GROUP_LABEL: Record<MuscleGroup, string> = {
    CHEST: "Грудь",
    BACK: "Спина",
    LEGS: "Ноги",
    ABS: "Пресс",
};

export function muscleGroupLabel(value?: MuscleGroup | null): string {
    return value ? MUSCLE_GROUP_LABEL[value] : "";
}
