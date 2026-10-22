package ru.fitapp.backend.pushsubscription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterDeviceTokenRequest {

    @NotBlank(message = "Токен обязателен")
    @Size(max = 4096)
    private String token;

    @NotBlank(message = "Платформа обязательна")
    @Pattern(regexp = "ANDROID|IOS", message = "Платформа: ANDROID или IOS")
    private String platform;

    public String getToken() {
        return token;
    }

    public RegisterDeviceTokenRequest setToken(String token) {
        this.token = token;
        return this;
    }

    public String getPlatform() {
        return platform;
    }

    public RegisterDeviceTokenRequest setPlatform(String platform) {
        this.platform = platform;
        return this;
    }
}
