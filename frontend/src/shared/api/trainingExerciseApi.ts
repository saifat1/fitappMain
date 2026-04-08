import { apiClient } from "./axios";
import type {
    CreateTrainingExerciseRequest,
    TrainingExerciseResponse,
    UpdateExerciseCompletionRequest,
    UpdateTrainingExerciseRequest,
} from "../../features/training-exercise/model/trainingExercise.types";

export const trainingExerciseApi = {
    getExercises: async (trainingId: number): Promise<TrainingExerciseResponse[]> => {
        const response = await apiClient.get<TrainingExerciseResponse[]>(
            `/trainings/${trainingId}/exercises`
        );
        return response.data;
    },

    createExercise: async (
        trainingId: number,
        payload: CreateTrainingExerciseRequest
    ): Promise<TrainingExerciseResponse> => {
        const response = await apiClient.post<TrainingExerciseResponse>(
            `/trainings/${trainingId}/exercises`,
            payload
        );
        return response.data;
    },

    updateExercise: async (
        trainingId: number,
        exerciseId: number,
        payload: UpdateTrainingExerciseRequest
    ): Promise<TrainingExerciseResponse> => {
        const response = await apiClient.put<TrainingExerciseResponse>(
            `/trainings/${trainingId}/exercises/${exerciseId}`,
            payload
        );
        return response.data;
    },

    deleteExercise: async (trainingId: number, exerciseId: number): Promise<void> => {
        await apiClient.delete(`/trainings/${trainingId}/exercises/${exerciseId}`);
    },

    updateCompletion: async (
        trainingId: number,
        exerciseId: number,
        payload: UpdateExerciseCompletionRequest
    ): Promise<TrainingExerciseResponse> => {
        const response = await apiClient.patch<TrainingExerciseResponse>(
            `/trainings/${trainingId}/exercises/${exerciseId}/completion`,
            payload
        );
        return response.data;
    },
};