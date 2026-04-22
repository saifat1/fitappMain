package ru.fitapp.backend.auth.dto;

public class InviteDetailsResponse {

    private String email;
    private String firstName;
    private String lastName;
    private boolean existingClient;

    public String getEmail() {
        return email;
    }

    public InviteDetailsResponse setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getFirstName() {
        return firstName;
    }

    public InviteDetailsResponse setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public String getLastName() {
        return lastName;
    }

    public InviteDetailsResponse setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public boolean isExistingClient() {
        return existingClient;
    }

    public InviteDetailsResponse setExistingClient(boolean existingClient) {
        this.existingClient = existingClient;
        return this;
    }
}