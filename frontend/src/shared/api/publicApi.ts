import { apiClient } from "./axios";
import type { PublicPricingResponse } from "../../features/subscription/model/subscription.types";

/** FIT-74: build of the backend that answers (BUILD_COMMIT from deploy/release.sh). */
export type ServerVersion = { commit: string; startedAt: string };

/** Endpoints without sign-in. */
export const publicApi = {
    getVersion: async (): Promise<ServerVersion> => {
        const response = await apiClient.get("/public/version");
        return response.data;
    },

    getPricing: async (): Promise<PublicPricingResponse> => {
        const response = await apiClient.get("/public/pricing");
        return response.data;
    },
};
