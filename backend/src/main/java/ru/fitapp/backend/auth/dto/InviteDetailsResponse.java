package ru.fitapp.backend.auth.dto;

public class InviteDetailsResponse {

    private String email;

    public String getEmail() {
        return email;
    }

    public InviteDetailsResponse setEmail(String email) {
        this.email = email;
        return this;
    }
}