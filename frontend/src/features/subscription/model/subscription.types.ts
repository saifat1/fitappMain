export type PlanCode = "FREE" | "PRO" | "UNLIMITED";
export type BillingPeriod = "MONTH" | "YEAR";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "GRACE" | "FREE";

export type PlanResponse = {
    code: PlanCode;
    title: string;
    /** null — no limit. */
    clientLimit: number | null;
    monthPriceKopecks: number;
    yearPriceKopecks: number;
};

export type SubscriptionPaymentResponse = {
    id: number;
    createdAt: string;
    paidAt: string | null;
    plan: PlanCode;
    billingPeriod: BillingPeriod;
    amountKopecks: number;
    purpose: "PURCHASE" | "RENEWAL";
    status: "PENDING" | "SUCCEEDED" | "FAILED";
    failureReason: string | null;
};

export type PlanClientResponse = {
    clientId: number;
    name: string;
    workable: boolean;
    selected: boolean;
};

/** When `enabled` is false only `plans` is meaningful (payments not launched yet). */
export type SubscriptionResponse = {
    enabled: boolean;
    testMode: boolean;
    status: SubscriptionStatus | null;
    plan: PlanCode | null;
    planTitle: string | null;
    purchasedPlan: PlanCode | null;
    billingPeriod: BillingPeriod | null;
    trialEndsAt: string | null;
    paidUntil: string | null;
    graceUntil: string | null;
    autoRenew: boolean;
    paymentMethodTitle: string | null;
    clientLimit: number | null;
    activeClients: number;
    overLimit: boolean;
    plans: PlanResponse[];
    payments: SubscriptionPaymentResponse[];
    /** Filled only when over the limit. */
    clients: PlanClientResponse[];
};

export type CheckoutResponse = {
    paymentId: number;
    confirmationUrl: string;
};

export type TestPaymentResponse = {
    id: number;
    planTitle: string;
    billingPeriod: BillingPeriod;
    amountKopecks: number;
    status: SubscriptionPaymentResponse["status"];
};

export type TestPaymentOutcome = "PAY" | "PAY_FAILING_CARD" | "DECLINE";

/** 69000 → "690 ₽", 590000 → "5 900 ₽". */
export function formatRub(kopecks: number): string {
    return `${Math.round(kopecks / 100).toLocaleString("ru-RU")} ₽`;
}

export type SellerInfo = {
    name: string;
    inn: string;
    email: string;
    phone: string;
    city: string;
    taxStatus: string;
};

/** Public «Тарифы» page and the offer; seller details come from the server's settings. */
export type PublicPricingResponse = {
    seller: SellerInfo;
    plans: PlanResponse[];
    trialDays: number;
    graceDays: number;
};
