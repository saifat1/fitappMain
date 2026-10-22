package ru.fitapp.backend.subscription.dto;

import jakarta.validation.constraints.NotNull;

public record AutoRenewRequest(@NotNull(message = "Не указано значение автопродления") Boolean enabled) {
}
