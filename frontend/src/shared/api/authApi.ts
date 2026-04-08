import { apiClient } from "./axios";
import type {
    AuthResponse,
    CurrentUserResponse,
    LoginRequest,
    RegisterByInviteRequest,
} from "../../features/auth/model/auth.types";

export const authApi = {
    login: async (payload: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>("/auth/login", payload);
        return response.data;
    },

    registerByInvite: async (
        payload: RegisterByInviteRequest
    ): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>(
            "/auth/register-by-invite",
            payload
        );
        return response.data;
    },

    getMe: async (): Promise<CurrentUserResponse> => {
        const response = await apiClient.get<CurrentUserResponse>("/auth/me");
        return response.data;
    },
};