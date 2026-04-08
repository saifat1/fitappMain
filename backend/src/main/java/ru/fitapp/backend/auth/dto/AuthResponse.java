package ru.fitapp.backend.auth.dto;

public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private Long userId;
    private String email;
    private String role;

    public String getAccessToken() {
        return accessToken;
    }

    public AuthResponse setAccessToken(String accessToken) {
        this.accessToken = accessToken;
        return this;
    }

    public String getTokenType() {
        return tokenType;
    }

    public AuthResponse setTokenType(String tokenType) {
        this.tokenType = tokenType;
        return this;
    }

    public Long getUserId() {
        return userId;
    }

    public AuthResponse setUserId(Long userId) {
        this.userId = userId;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public AuthResponse setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getRole() {
        return role;
    }

    public AuthResponse setRole(String role) {
        this.role = role;
        return this;
    }
}