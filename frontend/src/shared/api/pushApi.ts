import { apiClient } from "./axios";

export type SubscribePushPayload = {
    endpoint: string;
    p256dhKey: string;
    authKey: string;
    userAgent?: string;
};

export const pushApi = {
    async getPublicKey(): Promise<string> {
        const response = await apiClient.get("/push/public-key");
        return response.data.publicKey as string;
    },

    async subscribe(payload: SubscribePushPayload): Promise<void> {
        await apiClient.post("/push/subscribe", payload);
    },

    async unsubscribe(endpoint: string): Promise<void> {
        await apiClient.post("/push/unsubscribe", { endpoint });
    },
};
