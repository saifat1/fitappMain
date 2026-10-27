package ru.fitapp.backend.subscription.dto;

import jakarta.validation.constraints.NotNull;
import ru.fitapp.backend.subscription.model.BillingPeriod;
import ru.fitapp.backend.subscription.model.SubscriptionPlan;

public record CheckoutRequest(
        @NotNull(message = "Не выбран тариф") SubscriptionPlan plan,
        @NotNull(message = "Не выбран период оплаты") BillingPeriod billingPeriod,
        // FIT-80: «Я согласен на автоматические списания согласно условиям оферты» — unticked by default
        Boolean autoRenewConsent
) {
}
