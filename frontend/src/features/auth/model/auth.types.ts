export type LoginRequest = {
    email: string;
    password: string;
};

export type RegisterByInviteRequest = {
    token: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
};

export type RegisterTrainerRequest = {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    /** FIT-72: where the trainer came from (see shared/lib/signupSource.ts). */
    source?: string;
};

export type InviteDetailsResponse = {
    email: string;
};

export type UserRole = "TRAINER" | "CLIENT";

export type AuthResponse = {
    accessToken: string;
    tokenType: string;
    userId: number;
    email: string;
    role: UserRole;
    admin: boolean;
    requiresConsent: boolean;
    requiredConsents: string[];
};

export type CurrentUserResponse = {
    id: number;
    email: string;
    role: UserRole;
    admin: boolean;
    firstName: string | null;
    lastName: string | null;
};

export type ApiErrorResponse = {
    code: string;
    message: string;
    timestamp: string;
};