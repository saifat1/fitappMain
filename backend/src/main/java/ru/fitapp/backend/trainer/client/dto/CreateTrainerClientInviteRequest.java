package ru.fitapp.backend.trainer.client.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class CreateTrainerClientInviteRequest {

    @Min(value = 1, message = "Срок действия приглашения должен быть не меньше 1 дня")
    @Max(value = 365, message = "Срок действия приглашения должен быть не больше 365 дней")
    private Integer expiresInDays;

    public Integer getExpiresInDays() {
        return expiresInDays;
    }

    public CreateTrainerClientInviteRequest setExpiresInDays(Integer expiresInDays) {
        this.expiresInDays = expiresInDays;
        return this;
    }
}