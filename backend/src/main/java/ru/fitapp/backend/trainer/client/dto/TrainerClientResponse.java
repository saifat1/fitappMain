package ru.fitapp.backend.trainer.client.dto;

import java.time.LocalDateTime;

public class TrainerClientResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String status;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public TrainerClientResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public TrainerClientResponse setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getFirstName() {
        return firstName;
    }

    public TrainerClientResponse setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public String getLastName() {
        return lastName;
    }

    public TrainerClientResponse setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public TrainerClientResponse setStatus(String status) {
        this.status = status;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public TrainerClientResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }
}