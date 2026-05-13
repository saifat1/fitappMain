import { apiClient } from "./axios";

export type AnalyticsEventType =
    | "APP_OPENED"
    | "CLIENT_CREATED"
    | "TRAINING_CREATED"
    | "TRAINING_COMPLETED"
    | "TRAINING_CANCELLED"
    | "BOOKING_REQUEST_CREATED"
    | "BOOKING_REQUEST_APPROVED"
    | "TEMPLATE_CREATED"
    | "TEMPLATE_USED"
    | "PROFILE_OPENED"
    | "CALENDAR_OPENED";

const SESSION_ID_KEY = "fitapp.analytics.sessionId";

function getOrCreateSessionId(): string {
    const existingSessionId = sessionStorage.getItem(SESSION_ID_KEY);

    if (existingSessionId) {
        return existingSessionId;
    }

    const newSessionId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    sessionStorage.setItem(SESSION_ID_KEY, newSessionId);

    return newSessionId;
}

export const analyticsApi = {
    async track(
        eventType: AnalyticsEventType,
        params?: {
            entityType?: string;
            entityId?: string | number;
            metadata?: Record<string, unknown>;
        }
    ): Promise<void> {
        try {
            await apiClient.post("/analytics/events", {
                eventType,
                sessionId: getOrCreateSessionId(),
                entityType: params?.entityType,
                entityId: params?.entityId === undefined ? undefined : String(params.entityId),
                metadata: params?.metadata ? JSON.stringify(params.metadata) : undefined,
            });
        } catch {
            // Аналитика не должна ломать пользовательский сценарий.
        }
    },
};