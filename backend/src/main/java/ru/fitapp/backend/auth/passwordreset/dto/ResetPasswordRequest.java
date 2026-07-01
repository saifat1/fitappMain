package ru.fitapp.backend.auth.passwordreset.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @NotBlank(message = "Токен обязателен")
    private String token;

    @NotBlank(message = "Пароль обязателен")
    @Size(min = 6, max = 100, message = "Пароль должен быть от 6 до 100 символов")
    private String newPassword;

    public String getToken() {
        return token;
    }

    public ResetPasswordRequest setToken(String token) {
        this.token = token;
        return this;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public ResetPasswordRequest setNewPassword(String newPassword) {
        this.newPassword = newPassword;
        return this;
    }
}
