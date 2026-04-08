export type TrainerClientResponse = {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
    createdAt: string;
};

export type UpdateTrainerClientRequest = {
    firstName?: string;
    lastName?: string;
};

export type CreateInviteRequest = {
    email?: string;
    expiresInDays?: number;
};

export type InviteResponse = {
    id: number;
    token: string;
    email: string | null;
    status: string;
    expiresAt: string;
    usedAt: string | null;
    registrationLink: string;
};