package ru.fitapp.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DeleteAccountRequest {

    @NotBlank(message = "Введите пароль, чтобы подтвердить удаление")
    @Size(max = 255)
    private String password;

    public String getPassword() {
        return password;
    }

    public DeleteAccountRequest setPassword(String password) {
        this.password = password;
        return this;
    }
}
