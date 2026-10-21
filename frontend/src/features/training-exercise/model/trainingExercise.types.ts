export type RepsMode = "NONE" | "EXACT" | "RANGE";

export type TrainingExerciseSet = {
    setNumber: number;
    reps: number | null;
    weight: number | null;
};

/** Per-set values sent to the API; sets are numbered by their position in the list. */
export type TrainingExerciseSetPayload = {
    reps?: number;
    weight?: number;
};

export type TrainingExerciseResponse = {
    id: number;
    trainingId: number;
    orderNum: number;
    title: string;
    description: string | null;
    sets: number | null;
    repsMode: RepsMode;
    repsValue: number | null;
    repsFrom: number | null;
    repsTo: number | null;
    repsDisplay: string;
    weight: number | null;
    durationSeconds: number | null;
    restSeconds: number | null;
    isCompleted: boolean;
    trainerNote: string | null;
    clientNote: string | null;
    setDetails: TrainingExerciseSet[];
    createdAt: string;
    updatedAt: string;
};

export type CreateTrainingExerciseRequest = {
    title: string;
    description?: string;
    sets?: number;
    repsMode?: RepsMode;
    repsValue?: number;
    repsFrom?: number;
    repsTo?: number;
    weight?: number;
    durationSeconds?: number;
    restSeconds?: number;
    trainerNote?: string;
    setDetails?: TrainingExerciseSetPayload[];
};

export type UpdateTrainingExerciseRequest = {
    title?: string;
    description?: string;
    sets?: number;
    repsMode?: RepsMode;
    repsValue?: number;
    repsFrom?: number;
    repsTo?: number;
    weight?: number;
    durationSeconds?: number;
    restSeconds?: number;
    isCompleted?: boolean;
    trainerNote?: string;
    clientNote?: string;
    orderNum?: number;
    setDetails?: TrainingExerciseSetPayload[];
};

export type UpdateExerciseCompletionRequest = {
    isCompleted: boolean;
};