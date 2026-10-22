package ru.fitapp.backend.subscription.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** Test mode only: pretend the trial / paid period ended {@code daysAgo} days ago and run renewals. */
public record TestShiftRequest(
        @NotNull(message = "Не указано число дней")
        @Min(value = 0, message = "Число дней не может быть отрицательным")
        @Max(value = 30, message = "Не больше 30 дней")
        Integer daysAgo
) {
}
