export type TrainingType = "PERSONAL" | "INDEPENDENT" | "CIRCUIT";

export const TRAINING_TYPE_LABEL: Record<TrainingType, string> = {
    PERSONAL: "Персональная",
    INDEPENDENT: "Самостоятельная",
    CIRCUIT: "Круговая",
};

/** "Круговая · <название>" for circuit trainings, otherwise the plain type label. */
export function trainingTitle(training: Pick<TrainingResponse, "trainingType" | "title">): string {
    const label = TRAINING_TYPE_LABEL[training.trainingType] ?? TRAINING_TYPE_LABEL.PERSONAL;
    return training.trainingType === "CIRCUIT" && training.title ? `${label} · ${training.title}` : label;
}

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
    cancelledBy: "CLIENT" | "TRAINER" | null;
    trainingType: TrainingType;
    focusMuscleGroups: string[];
    /** Circuit trainings only. */
    title: string | null;
    description: string | null;
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
    title?: string;
    description?: string;
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
    { code: "SHOULDERS", label: "Плечи" },
    { code: "LEGS", label: "Ноги" },
    { code: "GLUTES", label: "Ягодицы" },
    { code: "ABS", label: "Пресс" },
];