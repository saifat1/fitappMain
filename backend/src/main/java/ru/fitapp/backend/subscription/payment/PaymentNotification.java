package ru.fitapp.backend.subscription.payment;

import ru.fitapp.backend.subscription.model.PaymentStatus;

/** Outcome of a payment reported by the provider (or by the test payment page). */
public record PaymentNotification(
        String providerPaymentId,
        PaymentStatus status,
        String paymentMethodToken,
        String paymentMethodTitle,
        String failureReason
) {
}
