export type TrainingType = "PERSONAL" | "INDEPENDENT";

export type TrainingResponse = {
    id: number;
    trainerId: number;
    clientId: number;
    clientEmail: string;
    clientFirstName: string | null;
    clientLastName: string | null;
    trainingDate: string;
    startTime: string | null;
    endTime: string | null;
    status: string;
    trainingType: TrainingType;
    focusMuscleGroups: string[];
    trainerNote: string | null;
    clientNote: string | null;
    contractId: number | null;
    contractNumber: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateTrainingRequest = {
    clientId: number;
    trainingDate: string;
    startTime?: string;
    endTime?: string;
    trainerNote?: string;
    trainingType?: TrainingType;
    focusMuscleGroups?: string[];
};

export type UpdateTrainingRequest = {
    trainingDate?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    trainerNote?: string;
};

export const MUSCLE_GROUP_OPTIONS: { code: string; label: string }[] = [
    { code: "CHEST", label: "Грудь" },
    { code: "BACK", label: "Спина" },
    { code: "LEGS", label: "Ноги" },
    { code: "GLUTES", label: "Ягодицы" },
    { code: "ABS", label: "Пресс" },
];