import { apiClient } from "./axios";
import type {
    ChangeTrainerPasswordRequest,
    TrainerProfileResponse,
    TrainerReportsResponse,
    UpdateTrainerProfileRequest,
} from "../../features/trainer-profile/model/trainerProfile.types";

type GetReportsParams = {
    from?: string;
    to?: string;
    clientId?: number;
    status?: "PLANNED" | "COMPLETED" | "CANCELLED";
};

export const trainerProfileApi = {
    getProfile: async (): Promise<TrainerProfileResponse> => {
        const response = await apiClient.get("/trainer/profile");
        return response.data;
    },

    updateProfile: async (
        payload: UpdateTrainerProfileRequest
    ): Promise<TrainerProfileResponse> => {
        const response = await apiClient.put("/trainer/profile", payload);
        return response.data;
    },

    changePassword: async (payload: ChangeTrainerPasswordRequest): Promise<void> => {
        await apiClient.post("/trainer/profile/change-password", payload);
    },

    getReports: async (params: GetReportsParams): Promise<TrainerReportsResponse> => {
        const response = await apiClient.get("/trainer/profile/reports", {
            params,
        });
        return response.data;
    },
};