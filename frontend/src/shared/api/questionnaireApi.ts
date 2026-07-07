import { apiClient } from "./axios";
import type {
    ClientQuestionnaireResponse,
    UpdateClientQuestionnaireRequest,
} from "../../features/questionnaire/model/questionnaire.types";

export const questionnaireApi = {
    async getForClient(clientId: number): Promise<ClientQuestionnaireResponse> {
        const response = await apiClient.get(`/trainer/clients/${clientId}/questionnaire`);
        return response.data;
    },

    async updateForClient(
        clientId: number,
        payload: UpdateClientQuestionnaireRequest
    ): Promise<ClientQuestionnaireResponse> {
        const response = await apiClient.put(`/trainer/clients/${clientId}/questionnaire`, payload);
        return response.data;
    },

    async getMy(): Promise<ClientQuestionnaireResponse> {
        const response = await apiClient.get("/client/questionnaire");
        return response.data;
    },
};
