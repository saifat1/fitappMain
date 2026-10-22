package ru.fitapp.backend.subscription.payment;

import ru.fitapp.backend.subscription.model.PaymentStatus;

/**
 * @param confirmationUrl     page the trainer is redirected to (null for saved-card charges)
 * @param paymentMethodToken  saved card id for future renewals, when already known
 * @param paymentMethodTitle  "Карта •• 4242"
 */
public record ProviderPayment(
        String providerPaymentId,
        PaymentStatus status,
        String confirmationUrl,
        String paymentMethodToken,
        String paymentMethodTitle,
        String failureReason
) {
}
