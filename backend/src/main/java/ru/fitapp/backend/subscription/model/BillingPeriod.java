package ru.fitapp.backend.subscription.model;

import java.time.LocalDateTime;

public enum BillingPeriod {
    MONTH,
    YEAR;

    public LocalDateTime addTo(LocalDateTime from) {
        return this == YEAR ? from.plusYears(1) : from.plusMonths(1);
    }
}
