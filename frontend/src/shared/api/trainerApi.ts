import { apiClient } from "./axios";
import type {
    CreateInviteRequest,
    CreateManualTrainerClientRequest,
    CreateTrainerClientInviteRequest,
    InviteResponse,
    TrainerClientResponse,
    UpdateTrainerClientRequest,
} from "../../features/trainer/model/trainer.types";

export const trainerApi = {
    getClients: async (): Promise<TrainerClientResponse[]> => {
        const response = await apiClient.get("/trainer/clients");
        return response.data;
    },

    getClient: async (clientId: number): Promise<TrainerClientResponse> => {
        const response = await apiClient.get(`/trainer/clients/${clientId}`);
        return response.data;
    },

    createManualClient: async (
        payload: CreateManualTrainerClientRequest
    ): Promise<TrainerClientResponse> => {
        const response = await apiClient.post("/trainer/clients/manual", payload);
        return response.data;
    },

    updateClient: async (
        clientId: number,
        payload: UpdateTrainerClientRequest
    ): Promise<TrainerClientResponse> => {
        const response = await apiClient.put(`/trainer/clients/${clientId}`, payload);
        return response.data;
    },

    deactivateClient: async (clientId: number): Promise<void> => {
        await apiClient.delete(`/trainer/clients/${clientId}`);
    },

    createInviteForClient: async (
        clientId: number,
        payload?: CreateTrainerClientInviteRequest
    ): Promise<InviteResponse> => {
        const response = await apiClient.post(
            `/trainer/clients/${clientId}/invite`,
            payload ?? {}
        );
        return response.data;
    },

    createInvite: async (payload: CreateInviteRequest): Promise<InviteResponse> => {
        const response = await apiClient.post("/trainer/invites", payload);
        return response.data;
    },

    getInvites: async (includeAll = false): Promise<InviteResponse[]> => {
        const response = await apiClient.get("/trainer/invites", {
            params: { includeAll },
        });
        return response.data;
    },

    deleteInvite: async (inviteId: number): Promise<void> => {
        await apiClient.delete(`/trainer/invites/${inviteId}`);
    },
};