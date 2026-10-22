import { apiClient } from "./axios";
import type { PublicPricingResponse } from "../../features/subscription/model/subscription.types";

/** Endpoints without sign-in. */
export const publicApi = {
    getPricing: async (): Promise<PublicPricingResponse> => {
        const response = await apiClient.get("/public/pricing");
        return response.data;
    },
};
