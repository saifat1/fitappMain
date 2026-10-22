package ru.fitapp.backend.subscription.dto;

/** What the test payment page shows. */
public record TestPaymentResponse(Long id, String planTitle, String billingPeriod, int amountKopecks, String status) {
}
