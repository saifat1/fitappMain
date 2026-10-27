package ru.fitapp.backend.subscription.payment;

/**
 * @param paymentId    our subscription_payment.id, passed to the provider as order id / metadata
 * @param description  shown to the payer and printed on the receipt
 * @param returnUrl    where the provider sends the trainer back after paying
 * @param payerEmail   for the receipt
 * @param recurring    bind the card for automatic renewals — only with the trainer's consent (FIT-80)
 */
public record PaymentRequest(
        Long paymentId,
        int amountKopecks,
        String description,
        String returnUrl,
        String payerEmail,
        boolean recurring
) {
}
