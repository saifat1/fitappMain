import { apiClient } from "./axios";
import type {
    AuthResponse,
    CurrentUserResponse,
    InviteDetailsResponse,
    LoginRequest,
    RegisterByInviteRequest,
    RegisterTrainerRequest,
    UserRole,
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

    registerTrainer: async (
        payload: RegisterTrainerRequest
    ): Promise<AuthResponse> => {
        const response = await apiClient.post("/auth/register-trainer", payload);
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

    forgotPassword: async (email: string): Promise<void> => {
        await apiClient.post("/auth/forgot-password", { email });
    },

    /** FIT-83: returns whose password was changed. */
    resetPassword: async (token: string, newPassword: string): Promise<{ email: string; role: UserRole }> => {
        const response = await apiClient.post("/auth/reset-password", { token, newPassword });
        return response.data;
    },

    /** FIT-70: the signed-in user deletes their own account (personal data is wiped, history stays anonymous). */
    deleteAccount: async (password: string): Promise<void> => {
        await apiClient.post("/auth/delete-account", { password });
    },
};