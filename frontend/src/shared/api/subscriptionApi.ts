import { apiClient } from "./axios";
import type {
    BillingPeriod,
    CheckoutResponse,
    PlanCode,
    SubscriptionResponse,
    TestPaymentOutcome,
    TestPaymentResponse,
} from "../../features/subscription/model/subscription.types";

export const subscriptionApi = {
    getCurrent: async (): Promise<SubscriptionResponse> => {
        const response = await apiClient.get("/trainer/subscription");
        return response.data;
    },

    /** autoRenewConsent (FIT-80): the ticked «Я согласен на автоматические списания…» — otherwise a one-time payment. */
    checkout: async (plan: PlanCode, billingPeriod: BillingPeriod, autoRenewConsent: boolean): Promise<CheckoutResponse> => {
        const response = await apiClient.post("/trainer/subscription/checkout", { plan, billingPeriod, autoRenewConsent });
        return response.data;
    },

    setAutoRenew: async (enabled: boolean): Promise<SubscriptionResponse> => {
        const response = await apiClient.put("/trainer/subscription/auto-renew", { enabled });
        return response.data;
    },

    selectWorkableClients: async (clientIds: number[]): Promise<SubscriptionResponse> => {
        const response = await apiClient.put("/trainer/subscription/workable-clients", { clientIds });
        return response.data;
    },

    // Test mode only (no real payment provider connected yet).

    getTestPayment: async (paymentId: number): Promise<TestPaymentResponse> => {
        const response = await apiClient.get(`/trainer/subscription/test-payments/${paymentId}`);
        return response.data;
    },

    completeTestPayment: async (paymentId: number, outcome: TestPaymentOutcome): Promise<SubscriptionResponse> => {
        const response = await apiClient.post(`/trainer/subscription/test-payments/${paymentId}/complete`, { outcome });
        return response.data;
    },

    shiftForTest: async (daysAgo: number): Promise<SubscriptionResponse> => {
        const response = await apiClient.post("/trainer/subscription/test/shift", { daysAgo });
        return response.data;
    },
};
