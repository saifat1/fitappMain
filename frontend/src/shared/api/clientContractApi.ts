import { apiClient } from "./axios";
import type {
    AddTrainingsToContractRequest,
    ClientContractResponse,
    CreateClientContractRequest,
} from "../../features/contract/model/contract.types";

export const clientContractApi = {
    async getContracts(clientId: number): Promise<ClientContractResponse[]> {
        const response = await apiClient.get(`/trainer/clients/${clientId}/contracts`);
        return response.data;
    },

    async createContract(
        clientId: number,
        payload: CreateClientContractRequest
    ): Promise<ClientContractResponse> {
        const response = await apiClient.post(`/trainer/clients/${clientId}/contracts`, payload);
        return response.data;
    },

    async addTrainings(
        clientId: number,
        contractId: number,
        payload: AddTrainingsToContractRequest
    ): Promise<ClientContractResponse> {
        const response = await apiClient.post(
            `/trainer/clients/${clientId}/contracts/${contractId}/add-trainings`,
            payload
        );
        return response.data;
    },
};
