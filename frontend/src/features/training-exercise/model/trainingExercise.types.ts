export type TrainingExerciseResponse = {
    id: number;
    trainingId: number;
    orderNum: number;
    title: string;
    description: string | null;
    sets: number | null;
    reps: number | null;
    durationSeconds: number | null;
    restSeconds: number | null;
    isCompleted: boolean;
    trainerNote: string | null;
    clientNote: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateTrainingExerciseRequest = {
    title: string;
    description?: string;
    sets?: number;
    reps?: number;
    durationSeconds?: number;
    restSeconds?: number;
    trainerNote?: string;
};

export type UpdateTrainingExerciseRequest = {
    title?: string;
    description?: string;
    sets?: number;
    reps?: number;
    durationSeconds?: number;
    restSeconds?: number;
    isCompleted?: boolean;
    trainerNote?: string;
    clientNote?: string;
    orderNum?: number;
};

export type UpdateExerciseCompletionRequest = {
    isCompleted: boolean;
};