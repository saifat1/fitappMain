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
};

export type InviteDetailsResponse = {
    email: string;
};

export type AuthResponse = {
    accessToken: string;
    tokenType: string;
    userId: number;
    email: string;
    role: string;
};

export type CurrentUserResponse = {
    id: number;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
};

export type ApiErrorResponse = {
    code: string;
    message: string;
    timestamp: string;
};