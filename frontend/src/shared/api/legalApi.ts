import { apiClient } from "./axios";

export type ConsentStatusResponse = {
    requiresConsent: boolean;
    requiredConsents: string[];
};

export const legalApi = {
    getConsentStatus: async (): Promise<ConsentStatusResponse> => {
        const response = await apiClient.get("/legal/consents/status");
        return response.data;
    },

    acceptRequiredConsents: async (): Promise<ConsentStatusResponse> => {
        const response = await apiClient.post("/legal/consents/accept");
        return response.data;
    },
};