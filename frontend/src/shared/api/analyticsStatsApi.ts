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
    rangeFrom: string;
    rangeTo: string;

    trainerLoginCount: number;
    clientLoginCount: number;

    totalTrainings: number;
    plannedTrainings: number;
    completedTrainings: number;

    activeClientsRange: number;
    activeTrainersRange: number;

    activeClientsToday: number;
    activeClientsWeek: number;
    activeTrainersToday: number;
    activeTrainersWeek: number;

    topEvents: AnalyticsEventCount[];
    inactiveUsers: InactiveUser[];
};

export type AnalyticsSummaryParams = {
    from?: string;
    to?: string;
};

export const analyticsStatsApi = {
    async getSummary(params?: AnalyticsSummaryParams): Promise<AnalyticsSummary> {
        const response = await apiClient.get<AnalyticsSummary>("/analytics/summary", {
            params,
        });

        return response.data;
    },
};