package ru.fitapp.backend.auth.passwordreset.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ForgotPasswordRequest {

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный email")
    @Size(max = 255)
    private String email;

    public String getEmail() {
        return email;
    }

    public ForgotPasswordRequest setEmail(String email) {
        this.email = email;
        return this;
    }
}
