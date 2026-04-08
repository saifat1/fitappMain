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
    firstName: string;
    lastName: string;
};

export type ApiErrorResponse = {
    code: string;
    message: string;
    timestamp: string;
};