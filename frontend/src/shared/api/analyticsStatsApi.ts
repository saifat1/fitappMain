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

type CountRow = { count: number } & Record<string, string | number>;

/** FIT-72: see ProductMetricsService (backend) — counted from the domain tables for the period. */
export type ProductMetrics = {
    from: string;
    to: string;
    acquisition: {
        trainersRegistered: number;
        clientsRegistered: number;
        clientsAddedByTrainers: number;
        trainersBySource: CountRow[];
    };
    activation: { days: number; registered: number; addedClient: number; createdTraining: number; completedTraining: number };
    retention: { weekStart: string; registered: number; activeWeek1: number | null; activeWeek4: number | null; activeWeek12: number | null }[];
    usage: {
        activeTrainers: number;
        activeClients: number;
        trainingsCreated: number;
        trainingsCompleted: number;
        trainingsCompletedPerActiveTrainer: number;
        trainingsByType: CountRow[];
        trainingsCancelled: number;
        bookingRequests: number;
        bookingRequestsApproved: number;
        contractsCreated: number;
        feedbackReceived: number;
        appDevicesWithPush: number;
    };
    money: {
        revenueRub: number;
        paymentsSucceeded: number;
        renewalsSucceeded: number;
        paymentsFailed: number;
        newPayingTrainers: number;
        activePaidNow: number;
        inTrialNow: number;
        autoRenewOffNow: number;
        byPlan: CountRow[];
    };
    quality: { serverErrorsSinceStart: number; backendStartedAt: string; paymentsFailed: number };
    totals: { trainers: number; clients: number; clientsRegistered: number; trainingsCompleted: number };
};

export const analyticsStatsApi = {
    /** FIT-72: product metrics for a period (admin). Shape: ProductMetricsService on the backend. */
    async getMetrics(params?: AnalyticsSummaryParams): Promise<ProductMetrics> {
        const response = await apiClient.get<ProductMetrics>("/analytics/metrics", { params });
        return response.data;
    },

    async getSummary(params?: AnalyticsSummaryParams): Promise<AnalyticsSummary> {
        const response = await apiClient.get<AnalyticsSummary>("/analytics/summary", {
            params,
        });

        return response.data;
    },
};