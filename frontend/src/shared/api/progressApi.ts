import { apiClient } from "./axios";

/** FIT-76: what the chart shows — best weight (kg), else max reps, else duration (seconds). */
export type ProgressMetric = "WEIGHT" | "REPS" | "DURATION";

export type ProgressPoint = {
    trainingId: number;
    date: string;
    value: number;
    volume: number | null;
    /** «3×8 по 70 кг» */
    summary: string;
    /** More than in any earlier training. */
    record: boolean;
};

export type ProgressSummary = {
    key: string;
    title: string;
    metric: ProgressMetric;
    trainings: number;
    firstValue: number;
    lastValue: number;
    lastDate: string;
    recentValues: number[];
};

export type ProgressSeries = {
    key: string;
    title: string;
    metric: ProgressMetric;
    points: ProgressPoint[];
};

export type PreviousExercise = {
    trainingId: number;
    date: string;
    summary: string;
};

/** The trainer about a client (clientId), or the client about themselves (no clientId). */
export const progressApi = {
    getSummaries: async (clientId?: number): Promise<ProgressSummary[]> => {
        const url = clientId ? `/trainer/clients/${clientId}/progress` : "/client/progress";
        const response = await apiClient.get(url);
        return response.data;
    },

    getSeries: async (key: string, clientId?: number): Promise<ProgressSeries> => {
        const url = clientId ? `/trainer/clients/${clientId}/progress/series` : "/client/progress/series";
        const response = await apiClient.get(url, { params: { key } });
        return response.data;
    },

    /** «В прошлый раз» for a saved training; null when the client hasn't done this exercise before. */
    previousForTraining: async (trainingId: number, title: string): Promise<PreviousExercise | null> => {
        const response = await apiClient.get(`/trainings/${trainingId}/exercises/previous`, { params: { title } });
        return response.data || null;
    },

    /** The same on the «Новая тренировка» screen, before the training exists. */
    previousForClient: async (clientId: number, title: string): Promise<PreviousExercise | null> => {
        const response = await apiClient.get(`/trainer/clients/${clientId}/progress/previous`, { params: { title } });
        return response.data || null;
    },
};
