export type ExerciseTemplateResponse = {
    id: number;
    trainerId: number;
    name: string;
    description?: string | null;
    sets?: number | null;
    reps?: number | null;
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
    sets?: number;
    reps?: number;
    durationSeconds?: number;
    restSeconds?: number;
    trainerNote?: string;
};

export type UpdateExerciseTemplateRequest = CreateExerciseTemplateRequest;

export type ApplyExerciseTemplateRequest = {
    templateId: number;
};