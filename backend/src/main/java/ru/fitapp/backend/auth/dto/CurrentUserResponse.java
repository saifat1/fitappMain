package ru.fitapp.backend.auth.dto;

public class CurrentUserResponse {

    private Long id;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private boolean admin;

    public Long getId() {
        return id;
    }

    public CurrentUserResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public CurrentUserResponse setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getRole() {
        return role;
    }

    public CurrentUserResponse setRole(String role) {
        this.role = role;
        return this;
    }

    public String getFirstName() {
        return firstName;
    }

    public CurrentUserResponse setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public String getLastName() {
        return lastName;
    }

    public CurrentUserResponse setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public boolean isAdmin() {
        return admin;
    }

    public CurrentUserResponse setAdmin(boolean admin) {
        this.admin = admin;
        return this;
    }
}