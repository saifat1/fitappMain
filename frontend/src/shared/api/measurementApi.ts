import { apiClient } from "./axios";
import type {
    ClientMeasurementResponse,
    SaveClientMeasurementRequest,
} from "../../features/measurement/model/measurement.types";

export const measurementApi = {
    async getForClient(clientId: number): Promise<ClientMeasurementResponse[]> {
        const response = await apiClient.get(`/trainer/clients/${clientId}/measurements`);
        return response.data;
    },

    async create(
        clientId: number,
        payload: SaveClientMeasurementRequest
    ): Promise<ClientMeasurementResponse> {
        const response = await apiClient.post(`/trainer/clients/${clientId}/measurements`, payload);
        return response.data;
    },

    async update(
        clientId: number,
        measurementId: number,
        payload: SaveClientMeasurementRequest
    ): Promise<ClientMeasurementResponse> {
        const response = await apiClient.put(
            `/trainer/clients/${clientId}/measurements/${measurementId}`,
            payload
        );
        return response.data;
    },

    async remove(clientId: number, measurementId: number): Promise<void> {
        await apiClient.delete(`/trainer/clients/${clientId}/measurements/${measurementId}`);
    },

    async getMy(): Promise<ClientMeasurementResponse[]> {
        const response = await apiClient.get("/client/measurements");
        return response.data;
    },
};
