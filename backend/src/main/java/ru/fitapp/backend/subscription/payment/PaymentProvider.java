package ru.fitapp.backend.subscription.payment;

import java.util.Map;
import java.util.Optional;

/**
 * Adapter to a payment service (Robokassa / ЮKassa — to be connected once the trainer-owner is
 * registered there as самозанятый). The active one is chosen by {@code app.billing.provider}.
 * Receipts to «Мой налог» are expected to be sent by the provider itself (e.g. «Робочеки СМЗ»).
 */
public interface PaymentProvider {

    /** Value of {@code app.billing.provider}, stored in subscription_payment.provider. */
    String code();

    /**
     * Starts a payment the trainer confirms on the provider's page; the card is saved for renewals.
     * The result normally is PENDING with a confirmation URL; the outcome comes later via
     * {@link #parseNotification} (or the test provider's own page).
     */
    ProviderPayment createPayment(PaymentRequest request);

    /** Charges a saved card without the trainer (renewal). May finish right away or stay PENDING. */
    ProviderPayment chargeSavedMethod(PaymentRequest request, String paymentMethodToken);

    /**
     * Parses and verifies the provider's server-to-server notification (signature check is the
     * provider's job). Empty — not a notification this provider understands / signature mismatch.
     */
    Optional<PaymentNotification> parseNotification(Map<String, String> headers, String body);

    /** Body of the reply to an accepted notification (Robokassa expects "OK{InvId}"). */
    default String acknowledge(PaymentNotification notification) {
        return "OK";
    }
}
