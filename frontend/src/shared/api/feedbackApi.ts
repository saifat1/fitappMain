import { apiClient } from "./axios";

export type FeedbackType = "IDEA" | "BUG" | "OTHER";
export type FeedbackStatus = "NEW" | "ACCEPTED" | "PLANNED" | "DONE" | "DECLINED";

export type FeedbackItem = {
    id: number;
    type: FeedbackType;
    text: string;
    status: FeedbackStatus;
    platform: string;
    screen: string | null;
    createdAt: string;
    /** Filled only in the admin list. */
    authorId: number | null;
    authorName: string | null;
    authorEmail: string | null;
    authorRole: string | null;
};

/** FIT-73: «Предложить идею / Сообщить о проблеме». */
export const feedbackApi = {
    create: async (payload: { type: FeedbackType; text: string; platform: string; screen?: string }): Promise<FeedbackItem> => {
        const response = await apiClient.post("/feedback", payload);
        return response.data;
    },

    getMine: async (): Promise<FeedbackItem[]> => {
        const response = await apiClient.get("/feedback/mine");
        return response.data;
    },

    getAll: async (status?: FeedbackStatus): Promise<FeedbackItem[]> => {
        const response = await apiClient.get("/admin/feedback", { params: status ? { status } : {} });
        return response.data;
    },

    updateStatus: async (id: number, status: FeedbackStatus): Promise<FeedbackItem> => {
        const response = await apiClient.patch(`/admin/feedback/${id}`, { status });
        return response.data;
    },
};

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
    IDEA: "Идея",
    BUG: "Проблема",
    OTHER: "Другое",
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
    NEW: "Новое",
    ACCEPTED: "Принято",
    PLANNED: "В планах",
    DONE: "Сделано",
    DECLINED: "Не будем делать",
};

export const FEEDBACK_STATUS_PILL: Record<FeedbackStatus, string> = {
    NEW: "fb-pill--invite",
    ACCEPTED: "fb-pill--muted",
    PLANNED: "fb-pill--invite",
    DONE: "fb-pill--ok",
    DECLINED: "fb-pill--muted",
};
