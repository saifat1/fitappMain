import { apiClient } from "./axios";
import type { ClientHistoryResponse } from "../../features/client-history/model/clientHistory.types";

export const clientHistoryApi = {
    getClientHistory: async (clientId: number): Promise<ClientHistoryResponse> => {
        const response = await apiClient.get(`/trainer/clients/${clientId}/history`);
        return response.data;
    },
};