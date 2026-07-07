package ru.fitapp.backend.trainer.client.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TrainerClientResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String status;
    private LocalDateTime createdAt;
    private boolean createdByTrainer;
    private boolean claimedByClient;
    private LocalDateTime claimedAt;
    private String contractNumber;
    private LocalDate contractEndDate;
    private boolean hasContracts;
    private int totalRemainingTrainings;
    private boolean contractExhausted;

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

    public boolean isCreatedByTrainer() {
        return createdByTrainer;
    }

    public TrainerClientResponse setCreatedByTrainer(boolean createdByTrainer) {
        this.createdByTrainer = createdByTrainer;
        return this;
    }

    public boolean isClaimedByClient() {
        return claimedByClient;
    }

    public TrainerClientResponse setClaimedByClient(boolean claimedByClient) {
        this.claimedByClient = claimedByClient;
        return this;
    }

    public LocalDateTime getClaimedAt() {
        return claimedAt;
    }

    public TrainerClientResponse setClaimedAt(LocalDateTime claimedAt) {
        this.claimedAt = claimedAt;
        return this;
    }

    public String getContractNumber() {
        return contractNumber;
    }

    public TrainerClientResponse setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
        return this;
    }

    public LocalDate getContractEndDate() {
        return contractEndDate;
    }

    public TrainerClientResponse setContractEndDate(LocalDate contractEndDate) {
        this.contractEndDate = contractEndDate;
        return this;
    }

    public boolean isHasContracts() {
        return hasContracts;
    }

    public TrainerClientResponse setHasContracts(boolean hasContracts) {
        this.hasContracts = hasContracts;
        return this;
    }

    public int getTotalRemainingTrainings() {
        return totalRemainingTrainings;
    }

    public TrainerClientResponse setTotalRemainingTrainings(int totalRemainingTrainings) {
        this.totalRemainingTrainings = totalRemainingTrainings;
        return this;
    }

    public boolean isContractExhausted() {
        return contractExhausted;
    }

    public TrainerClientResponse setContractExhausted(boolean contractExhausted) {
        this.contractExhausted = contractExhausted;
        return this;
    }
}