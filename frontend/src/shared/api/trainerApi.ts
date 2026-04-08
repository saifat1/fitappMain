import { apiClient } from "./axios";
import type {
    CreateInviteRequest,
    InviteResponse,
    TrainerClientResponse,
    UpdateTrainerClientRequest,
} from "../../features/trainer/model/trainer.types";

export const trainerApi = {
    getClients: async (): Promise<TrainerClientResponse[]> => {
        const response = await apiClient.get<TrainerClientResponse[]>("/trainer/clients");
        return response.data;
    },

    getClient: async (clientId: number): Promise<TrainerClientResponse> => {
        const response = await apiClient.get<TrainerClientResponse>(`/trainer/clients/${clientId}`);
        return response.data;
    },

    updateClient: async (
        clientId: number,
        payload: UpdateTrainerClientRequest
    ): Promise<TrainerClientResponse> => {
        const response = await apiClient.put<TrainerClientResponse>(
            `/trainer/clients/${clientId}`,
            payload
        );
        return response.data;
    },

    deactivateClient: async (clientId: number): Promise<void> => {
        await apiClient.delete(`/trainer/clients/${clientId}`);
    },

    createInvite: async (payload: CreateInviteRequest): Promise<InviteResponse> => {
        const response = await apiClient.post<InviteResponse>("/trainer/invites", payload);
        return response.data;
    },

    getInvites: async (): Promise<InviteResponse[]> => {
        const response = await apiClient.get<InviteResponse[]>("/trainer/invites");
        return response.data;
    },
};