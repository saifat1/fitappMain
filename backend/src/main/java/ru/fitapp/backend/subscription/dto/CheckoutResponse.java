package ru.fitapp.backend.subscription.dto;

/** The frontend redirects the trainer to {@code confirmationUrl} (provider's or our test payment page). */
public record CheckoutResponse(Long paymentId, String confirmationUrl) {
}
