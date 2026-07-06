import { apiClient } from "./axios";

export const trainingApi = {
    getTrainings: (from: string, to: string) =>
        apiClient.get(`/trainings?from=${from}&to=${to}`).then((r) => r.data),

    getTraining: (id: number) =>
        apiClient.get(`/trainings/${id}`).then((r) => r.data),

    createTraining: (payload: unknown) =>
        apiClient.post("/trainings", payload).then((r) => r.data),

    updateTraining: (id: number, payload: unknown) =>
        apiClient.put(`/trainings/${id}`, payload).then((r) => r.data),

    completeTraining: (id: number) =>
        apiClient.patch(`/trainings/${id}/complete`).then((r) => r.data),

    cancelTraining: (id: number) =>
        apiClient.patch(`/trainings/${id}/cancel`).then((r) => r.data),

    /** Client-only: cancel a training that belongs to the current client. */
    cancelMyTraining: (id: number) =>
        apiClient.post(`/client/trainings/${id}/cancel`).then((r) => r.data),

    restoreTrainingToPlanned: (id: number) =>
        apiClient.patch(`/trainings/${id}/restore-planned`).then((r) => r.data),
};