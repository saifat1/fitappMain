import { apiClient } from "./axios";
import type {
    CreateRescheduleRequestRequest,
    ProcessRescheduleRequestRequest,
    RescheduleRequestResponse,
} from "../../features/reschedule/model/reschedule.types";

export const rescheduleApi = {
    createRequest: async (
        trainingId: number,
        payload: CreateRescheduleRequestRequest
    ): Promise<RescheduleRequestResponse> => {
        const response = await apiClient.post<RescheduleRequestResponse>(
            `/reschedule-requests/training/${trainingId}`,
            payload
        );
        return response.data;
    },

    getRequests: async (): Promise<RescheduleRequestResponse[]> => {
        const response = await apiClient.get<RescheduleRequestResponse[]>(
            "/reschedule-requests"
        );
        return response.data;
    },

    getRequest: async (id: number): Promise<RescheduleRequestResponse> => {
        const response = await apiClient.get<RescheduleRequestResponse>(
            `/reschedule-requests/${id}`
        );
        return response.data;
    },

    processRequest: async (
        id: number,
        payload: ProcessRescheduleRequestRequest
    ): Promise<RescheduleRequestResponse> => {
        const response = await apiClient.post<RescheduleRequestResponse>(
            `/reschedule-requests/${id}/process`,
            payload
        );
        return response.data;
    },

    cancelRequest: async (id: number): Promise<void> => {
        await apiClient.post(`/reschedule-requests/${id}/cancel`);
    },
};