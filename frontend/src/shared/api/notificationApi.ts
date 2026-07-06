import { apiClient } from "./axios";
import type { NotificationResponse, UnreadCountResponse } from "../../features/notification/model/notification.types";

export const notificationApi = {
    async getMyNotifications(): Promise<NotificationResponse[]> {
        const response = await apiClient.get("/notifications");
        return response.data;
    },

    async getUnreadCount(): Promise<UnreadCountResponse> {
        const response = await apiClient.get("/notifications/unread-count");
        return response.data;
    },

    async markAsRead(id: number): Promise<NotificationResponse> {
        const response = await apiClient.post(`/notifications/${id}/read`);
        return response.data;
    },

    async markAllAsRead(): Promise<void> {
        await apiClient.post("/notifications/read-all");
    },
};
