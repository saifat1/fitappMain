export type TrainerClientResponse = {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
    createdAt: string;
    createdByTrainer: boolean;
    claimedByClient: boolean;
    claimedAt: string | null;
    contractNumber: string | null;
    contractEndDate: string | null;
};

export type UpdateTrainerClientRequest = {
    firstName?: string;
    lastName?: string;
    contractNumber?: string;
    contractEndDate?: string | null;
};

export type CreateManualTrainerClientRequest = {
    email?: string;
    firstName?: string;
    lastName?: string;
};

export type CreateTrainerClientInviteRequest = {
    expiresInDays?: number;
};

export type CreateInviteRequest = {
    email?: string;
    expiresInDays?: number;
};

export type InviteResponse = {
    id: number;
    clientId: number | null;
    token: string;
    email: string | null;
    status: string;
    expiresAt: string;
    usedAt: string | null;
    registrationLink: string;
};