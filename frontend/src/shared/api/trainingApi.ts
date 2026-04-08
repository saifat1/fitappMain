import { apiClient } from "./axios";
import type {
    CreateTrainingRequest,
    TrainingResponse,
    UpdateTrainingRequest,
} from "../../features/training/model/training.types";

export const trainingApi = {
    getTrainings: async (from: string, to: string): Promise<TrainingResponse[]> => {
        const response = await apiClient.get<TrainingResponse[]>("/trainings", {
            params: { from, to },
        });
        return response.data;
    },

    getTraining: async (trainingId: number): Promise<TrainingResponse> => {
        const response = await apiClient.get<TrainingResponse>(`/trainings/${trainingId}`);
        return response.data;
    },

    createTraining: async (payload: CreateTrainingRequest): Promise<TrainingResponse> => {
        const response = await apiClient.post<TrainingResponse>("/trainings", payload);
        return response.data;
    },

    updateTraining: async (
        trainingId: number,
        payload: UpdateTrainingRequest
    ): Promise<TrainingResponse> => {
        const response = await apiClient.put<TrainingResponse>(
            `/trainings/${trainingId}`,
            payload
        );
        return response.data;
    },

    cancelTraining: async (trainingId: number): Promise<void> => {
        await apiClient.delete(`/trainings/${trainingId}`);
    },
};