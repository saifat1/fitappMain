package ru.fitapp.backend.trainer.invite.dto;

import jakarta.validation.constraints.*;

public class CreateInviteRequest {

    @NotBlank(message = "Email клиента обязателен")
    @Size(max = 255, message = "Email не должен быть длиннее 255 символов")
    private String email;

    @Min(value = 1, message = "Срок действия приглашения должен быть не меньше 1 дня")
    @Max(value = 365, message = "Срок действия приглашения должен быть не больше 365 дней")
    @NotNull(message = "Срок действия обязателен")
    private Integer expiresInDays;

    public String getEmail() {
        return email;
    }

    public CreateInviteRequest setEmail(String email) {
        this.email = email;
        return this;
    }

    public Integer getExpiresInDays() {
        return expiresInDays;
    }

    public CreateInviteRequest setExpiresInDays(Integer expiresInDays) {
        this.expiresInDays = expiresInDays;
        return this;
    }
}