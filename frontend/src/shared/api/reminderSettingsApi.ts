import { apiClient } from "./axios";

/** FIT-75: «Напоминать о тренировках» — reminders to the client, the morning summary to the trainer. */
export type ReminderSettings = { enabled: boolean };

export const reminderSettingsApi = {
    get: async (): Promise<ReminderSettings> => {
        const response = await apiClient.get("/me/reminders");
        return response.data;
    },

    update: async (enabled: boolean): Promise<ReminderSettings> => {
        const response = await apiClient.put("/me/reminders", { enabled });
        return response.data;
    },
};
