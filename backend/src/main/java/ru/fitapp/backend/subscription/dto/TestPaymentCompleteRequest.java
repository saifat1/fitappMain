package ru.fitapp.backend.subscription.dto;

import jakarta.validation.constraints.NotNull;

/**
 * @param outcome PAY — card saved, renewals succeed; PAY_FAILING_CARD — paid now, renewals will be
 *                declined (to test the grace period); DECLINE — the bank declined this payment
 */
public record TestPaymentCompleteRequest(@NotNull(message = "Не указан результат оплаты") Outcome outcome) {

    public enum Outcome { PAY, PAY_FAILING_CARD, DECLINE }
}
