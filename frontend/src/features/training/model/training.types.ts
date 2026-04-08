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
    trainerNote: string | null;
    clientNote: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateTrainingRequest = {
    clientId: number;
    trainingDate: string;
    startTime?: string;
    endTime?: string;
    trainerNote?: string;
};

export type UpdateTrainingRequest = {
    trainingDate?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    trainerNote?: string;
};