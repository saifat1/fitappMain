import { apiClient } from "./axios";
import type {
    AuthResponse,
    CurrentUserResponse,
    InviteDetailsResponse,
    LoginRequest,
    RegisterByInviteRequest,
} from "../../features/auth/model/auth.types";

export const authApi = {
    login: async (payload: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post("/auth/login", payload);
        return response.data;
    },

    registerByInvite: async (
        payload: RegisterByInviteRequest
    ): Promise<AuthResponse> => {
        const response = await apiClient.post("/auth/register-by-invite", payload);
        return response.data;
    },

    getInviteDetails: async (token: string): Promise<InviteDetailsResponse> => {
        const response = await apiClient.get(`/auth/invites/${token}`);
        return response.data;
    },

    getMe: async (): Promise<CurrentUserResponse> => {
        const response = await apiClient.get("/auth/me");
        return response.data;
    },
};