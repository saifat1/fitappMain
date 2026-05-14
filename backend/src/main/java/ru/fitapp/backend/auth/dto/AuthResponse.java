package ru.fitapp.backend.auth.dto;

import java.util.List;

public class AuthResponse {

    private String accessToken;
    private String tokenType;
    private Long userId;
    private String email;
    private String role;
    private boolean admin;
    private boolean requiresConsent;
    private List<String> requiredConsents;

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

    public boolean isAdmin() {
        return admin;
    }

    public AuthResponse setAdmin(boolean admin) {
        this.admin = admin;
        return this;
    }

    public boolean isRequiresConsent() {
        return requiresConsent;
    }

    public AuthResponse setRequiresConsent(boolean requiresConsent) {
        this.requiresConsent = requiresConsent;
        return this;
    }

    public List<String> getRequiredConsents() {
        return requiredConsents;
    }

    public AuthResponse setRequiredConsents(List<String> requiredConsents) {
        this.requiredConsents = requiredConsents;
        return this;
    }
}