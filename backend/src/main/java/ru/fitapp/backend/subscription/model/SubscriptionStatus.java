package ru.fitapp.backend.subscription.model;

/** What the trainer currently has — derived from the stored dates, never stored itself. */
public enum SubscriptionStatus {
    /** Free 14-day trial of Pro. */
    TRIAL,
    /** Paid period is running. */
    ACTIVE,
    /** Paid period ended, renewal is being retried; everything still works (3 days). */
    GRACE,
    /** Free plan («Старт»). */
    FREE
}
