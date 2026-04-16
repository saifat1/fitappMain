import { apiClient } from "./axios";

import type {
    ApplyExerciseTemplateRequest,
    CreateExerciseTemplateRequest,
    ExerciseTemplateResponse,
    UpdateExerciseTemplateRequest,
} from "../../features/exercise-template/model/exerciseTemplate.types";
import type { TrainingExerciseResponse } from "../../features/training-exercise/model/trainingExercise.types";

export const exerciseTemplateApi = {
    getTemplates: (includeArchived = false): Promise<ExerciseTemplateResponse[]> =>
        apiClient
            .get(`/exercise-templates?includeArchived=${includeArchived}`)
            .then((r) => r.data),

    getTemplate: (templateId: number): Promise<ExerciseTemplateResponse> =>
        apiClient.get(`/exercise-templates/${templateId}`).then((r) => r.data),

    createTemplate: (
        payload: CreateExerciseTemplateRequest
    ): Promise<ExerciseTemplateResponse> =>
        apiClient.post("/exercise-templates", payload).then((r) => r.data),

    updateTemplate: (
        templateId: number,
        payload: UpdateExerciseTemplateRequest
    ): Promise<ExerciseTemplateResponse> =>
        apiClient.put(`/exercise-templates/${templateId}`, payload).then((r) => r.data),

    archiveTemplate: (templateId: number): Promise<void> =>
        apiClient.patch(`/exercise-templates/${templateId}/archive`).then(() => undefined),

    restoreTemplate: (templateId: number): Promise<void> =>
        apiClient.patch(`/exercise-templates/${templateId}/restore`).then(() => undefined),

    addTemplateToTraining: (
        trainingId: number,
        payload: ApplyExerciseTemplateRequest
    ): Promise<TrainingExerciseResponse> =>
        apiClient
            .post(`/trainings/${trainingId}/exercises/from-template`, payload)
            .then((r) => r.data),
};