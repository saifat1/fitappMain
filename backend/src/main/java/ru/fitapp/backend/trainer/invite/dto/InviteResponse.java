package ru.fitapp.backend.trainer.invite.dto;

import java.time.LocalDateTime;

public class InviteResponse {

    private Long id;
    private Long clientId;
    private String token;
    private String email;
    private String status;
    private LocalDateTime expiresAt;
    private LocalDateTime usedAt;
    private String registrationLink;

    public Long getId() {
        return id;
    }

    public InviteResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getClientId() {
        return clientId;
    }

    public InviteResponse setClientId(Long clientId) {
        this.clientId = clientId;
        return this;
    }

    public String getToken() {
        return token;
    }

    public InviteResponse setToken(String token) {
        this.token = token;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public InviteResponse setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public InviteResponse setStatus(String status) {
        this.status = status;
        return this;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public InviteResponse setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
        return this;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public InviteResponse setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
        return this;
    }

    public String getRegistrationLink() {
        return registrationLink;
    }

    public InviteResponse setRegistrationLink(String registrationLink) {
        this.registrationLink = registrationLink;
        return this;
    }
}