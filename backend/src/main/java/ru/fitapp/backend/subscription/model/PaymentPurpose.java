package ru.fitapp.backend.subscription.model;

public enum PaymentPurpose {
    /** The trainer pays on the «Подписка» screen (first payment, plan change, early renewal). */
    PURCHASE,
    /** Automatic charge of the saved card when the paid period ends. */
    RENEWAL
}
