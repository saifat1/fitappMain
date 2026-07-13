package ru.fitapp.backend.contract.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClientContractResponse {

    private Long id;
    private String contractNumber;
    private int totalTrainings;
    private int remainingTrainings;
    private int usedTrainings;
    private LocalDate endDate;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public ClientContractResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public String getContractNumber() {
        return contractNumber;
    }

    public ClientContractResponse setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
        return this;
    }

    public int getTotalTrainings() {
        return totalTrainings;
    }

    public ClientContractResponse setTotalTrainings(int totalTrainings) {
        this.totalTrainings = totalTrainings;
        return this;
    }

    public int getRemainingTrainings() {
        return remainingTrainings;
    }

    public ClientContractResponse setRemainingTrainings(int remainingTrainings) {
        this.remainingTrainings = remainingTrainings;
        return this;
    }

    public int getUsedTrainings() {
        return usedTrainings;
    }

    public ClientContractResponse setUsedTrainings(int usedTrainings) {
        this.usedTrainings = usedTrainings;
        return this;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public ClientContractResponse setEndDate(LocalDate endDate) {
        this.endDate = endDate;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public ClientContractResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }
}
