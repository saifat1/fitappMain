export type RepsMode = "NONE" | "EXACT" | "RANGE";

export type MuscleGroup = "CHEST" | "BACK" | "LEGS" | "ABS";

export type ExerciseTemplateResponse = {
    id: number;
    trainerId: number;
    name: string;
    description?: string | null;
    muscleGroup?: MuscleGroup | null;
    sets?: number | null;
    repsMode: RepsMode;
    repsValue?: number | null;
    repsFrom?: number | null;
    repsTo?: number | null;
    repsDisplay: string;
    weight?: number | null;
    durationSeconds?: number | null;
    restSeconds?: number | null;
    trainerNote?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
};

export type CreateExerciseTemplateRequest = {
    name: string;
    description?: string;
    muscleGroup?: MuscleGroup | null;
    sets?: number;
    repsMode?: RepsMode;
    repsValue?: number;
    repsFrom?: number;
    repsTo?: number;
    weight?: number;
    durationSeconds?: number;
    restSeconds?: number;
    trainerNote?: string;
};

export type UpdateExerciseTemplateRequest = CreateExerciseTemplateRequest;

export type ApplyExerciseTemplateRequest = {
    templateId: number;
};