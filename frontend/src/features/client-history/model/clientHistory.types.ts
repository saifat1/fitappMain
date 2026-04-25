export type ClientHistoryTrainingStatus =
    | "PLANNED"
    | "COMPLETED"
    | "CANCELLED";

export type ClientHistoryPeriod = "7d" | "30d" | "90d" | "all";

export type ClientHistoryStatusFilter =
    | "ALL"
    | "PLANNED"
    | "COMPLETED"
    | "CANCELLED";

export type ClientHistoryExercise = {
    id: number;
    orderNum: number | null;
    title: string;
    description: string | null;
    sets: number | null;
    repsMode: "NONE" | "EXACT" | "RANGE";
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
    createdAt: string;
    updatedAt: string;
};

export type ClientHistoryTraining = {
    id: number;
    trainingDate: string;
    startTime: string | null;
    endTime: string | null;
    status: ClientHistoryTrainingStatus;
    trainerNote: string | null;
    clientNote: string | null;
    createdAt: string;
    updatedAt: string;
    exercises: ClientHistoryExercise[];
};

export type ClientHistoryClient = {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
    createdByTrainer: boolean;
    claimedByClient: boolean;
    claimedAt: string | null;
};

export type ClientHistoryResponse = {
    client: ClientHistoryClient;
    trainings: ClientHistoryTraining[];
};

export type ClientHistoryFiltersState = {
    period: ClientHistoryPeriod;
    status: ClientHistoryStatusFilter;
    query: string;
    showOnlyWithNotes: boolean;
};