export type CreateRescheduleRequestRequest = {
    requestedTrainingDate: string;
    requestedStartTime?: string;
    requestedEndTime?: string;
    clientComment?: string;
};

export type ProcessRescheduleRequestRequest = {
    decision: string;
    trainerComment?: string;
};

export type RescheduleRequestResponse = {
    id: number;
    trainingId: number;
    requesterId: number;
    requesterEmail: string;
    requestedTrainingDate: string;
    requestedStartTime: string | null;
    requestedEndTime: string | null;
    clientComment: string | null;
    trainerComment: string | null;
    status: string;
    processedAt: string | null;
    createdAt: string;
    updatedAt: string;
};