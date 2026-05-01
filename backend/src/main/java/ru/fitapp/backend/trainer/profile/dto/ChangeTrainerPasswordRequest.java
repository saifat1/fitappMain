package ru.fitapp.backend.trainer.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangeTrainerPasswordRequest {

    @NotBlank(message = "Текущий пароль обязателен")
    private String currentPassword;

    @NotBlank(message = "Новый пароль обязателен")
    @Size(min = 6, max = 255, message = "Новый пароль должен содержать от 6 до 255 символов")
    private String newPassword;

    @NotBlank(message = "Подтверждение нового пароля обязательно")
    private String confirmPassword;

    public String getCurrentPassword() {
        return currentPassword;
    }

    public ChangeTrainerPasswordRequest setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
        return this;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public ChangeTrainerPasswordRequest setNewPassword(String newPassword) {
        this.newPassword = newPassword;
        return this;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public ChangeTrainerPasswordRequest setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
        return this;
    }
}