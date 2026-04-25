package ru.fitapp.backend.trainer.client.dto;

import java.time.LocalDateTime;

public class ClientHistoryClientResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String status;
    private boolean createdByTrainer;
    private boolean claimedByClient;
    private LocalDateTime claimedAt;

    public Long getId() {
        return id;
    }

    public ClientHistoryClientResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public ClientHistoryClientResponse setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getFirstName() {
        return firstName;
    }

    public ClientHistoryClientResponse setFirstName(String firstName) {
        this.firstName = firstName;
        return this;
    }

    public String getLastName() {
        return lastName;
    }

    public ClientHistoryClientResponse setLastName(String lastName) {
        this.lastName = lastName;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public ClientHistoryClientResponse setStatus(String status) {
        this.status = status;
        return this;
    }

    public boolean isCreatedByTrainer() {
        return createdByTrainer;
    }

    public ClientHistoryClientResponse setCreatedByTrainer(boolean createdByTrainer) {
        this.createdByTrainer = createdByTrainer;
        return this;
    }

    public boolean isClaimedByClient() {
        return claimedByClient;
    }

    public ClientHistoryClientResponse setClaimedByClient(boolean claimedByClient) {
        this.claimedByClient = claimedByClient;
        return this;
    }

    public LocalDateTime getClaimedAt() {
        return claimedAt;
    }

    public ClientHistoryClientResponse setClaimedAt(LocalDateTime claimedAt) {
        this.claimedAt = claimedAt;
        return this;
    }
}