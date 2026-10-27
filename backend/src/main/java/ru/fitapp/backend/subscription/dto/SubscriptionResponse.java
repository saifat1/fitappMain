package ru.fitapp.backend.subscription.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * State of the «Подписка» screen. When {@code enabled} is false only {@code plans} is filled.
 *
 * @param status        TRIAL / ACTIVE / GRACE / FREE
 * @param plan          effective plan right now (trial → PRO)
 * @param purchasedPlan last paid plan (what renewals charge)
 * @param clientLimit   null — no limit
 * @param testMode      payments go through the test page, no real money
 * @param clients       active clients with their workable flag — only when over the limit
 * @param cardSaved     a card is bound for automatic renewals (paid with the consent to automatic charges)
 */
public record SubscriptionResponse(
        boolean enabled,
        boolean testMode,
        String status,
        String plan,
        String planTitle,
        String purchasedPlan,
        String billingPeriod,
        LocalDateTime trialEndsAt,
        LocalDateTime paidUntil,
        LocalDateTime graceUntil,
        boolean autoRenew,
        String paymentMethodTitle,
        boolean cardSaved,
        Integer clientLimit,
        int activeClients,
        boolean overLimit,
        List<PlanResponse> plans,
        List<PaymentResponse> payments,
        List<PlanClientResponse> clients
) {

    public record PlanResponse(String code, String title, Integer clientLimit, int monthPriceKopecks, int yearPriceKopecks) {
    }

    public record PaymentResponse(
            Long id,
            LocalDateTime createdAt,
            LocalDateTime paidAt,
            String plan,
            String billingPeriod,
            int amountKopecks,
            String purpose,
            String status,
            String failureReason
    ) {
    }

    public record PlanClientResponse(Long clientId, String name, boolean workable, boolean selected) {
    }
}
