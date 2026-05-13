import { apiClient } from "./axios";

export type AnalyticsEventCount = {
    eventType: string;
    count: number;
};

export type InactiveUser = {
    id: number;
    email: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
    lastLoginAt?: string | null;
    lastSeenAt?: string | null;
    loginCount?: number | null;
};

export type AnalyticsSummary = {
    trainerLoginCount: number;
    clientLoginCount: number;

    totalTrainings: number;
    plannedTrainings: number;
    completedTrainings: number;

    activeClientsToday: number;
    activeClientsWeek: number;
    activeTrainersToday: number;
    activeTrainersWeek: number;

    topEvents: AnalyticsEventCount[];
    inactiveUsers: InactiveUser[];
};

export const analyticsStatsApi = {
    async getSummary(): Promise<AnalyticsSummary> {
        const response = await apiClient.get<AnalyticsSummary>("/analytics/summary");
        return response.data;
    },
};