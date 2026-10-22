package ru.fitapp.backend.subscription.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

/** Clients that stay workable when there are more active clients than the plan allows. */
public record WorkableClientsRequest(@NotNull(message = "Не выбраны клиенты") List<Long> clientIds) {
}
