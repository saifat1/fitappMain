package ru.fitapp.backend.subscription.dto;

import java.util.List;

/**
 * Public «Тарифы» page and the offer: seller details (required by the payment provider) and plans.
 * Seller details come from the server's .env, not from the public repository.
 */
public record PublicPricingResponse(
        Seller seller,
        List<SubscriptionResponse.PlanResponse> plans,
        int trialDays,
        int graceDays
) {

    /** Empty strings mean "not configured yet" — the page shows a dash. City stands in for the address of a самозанятый. */
    public record Seller(String name, String inn, String email, String phone, String city, String taxStatus) {
    }
}
