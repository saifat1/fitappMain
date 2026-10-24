import { apiClient } from "./axios";

export const trainingApi = {
    /** includeClientOwn (FIT-77, trainer): also the trainings clients wrote down themselves — for the client's archive. */
    getTrainings: (from: string, to: string, includeClientOwn = false) =>
        apiClient
            .get(`/trainings?from=${from}&to=${to}${includeClientOwn ? "&includeClientOwn=true" : ""}`)
            .then((r) => r.data),

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

    /** FIT-77, client-only: write down a self-guided training for yourself. */
    createMyTraining: (payload: unknown) =>
        apiClient.post("/client/trainings", payload).then((r) => r.data),

    /** Client-only: cancel a training that belongs to the current client. */
    cancelMyTraining: (id: number) =>
        apiClient.post(`/client/trainings/${id}/cancel`).then((r) => r.data),

    restoreTrainingToPlanned: (id: number) =>
        apiClient.patch(`/trainings/${id}/restore-planned`).then((r) => r.data),

    /** "Удалить" swipe action on a cancelled training — clears it from the schedule now, keeps it in history/reports. */
    hideFromSchedule: (id: number) =>
        apiClient.post(`/trainings/${id}/hide`).then((r) => r.data),
};