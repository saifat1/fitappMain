package ru.fitapp.backend.training.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class TrainingResponse {

    private Long id;
    private Long trainerId;
    private Long clientId;
    private String clientEmail;
    private String clientFirstName;
    private String clientLastName;
    private LocalDate trainingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String trainerNote;
    private String clientNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public TrainingResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getTrainerId() {
        return trainerId;
    }

    public TrainingResponse setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
        return this;
    }

    public Long getClientId() {
        return clientId;
    }

    public TrainingResponse setClientId(Long clientId) {
        this.clientId = clientId;
        return this;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public TrainingResponse setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
        return this;
    }

    public String getClientFirstName() {
        return clientFirstName;
    }

    public TrainingResponse setClientFirstName(String clientFirstName) {
        this.clientFirstName = clientFirstName;
        return this;
    }

    public String getClientLastName() {
        return clientLastName;
    }

    public TrainingResponse setClientLastName(String clientLastName) {
        this.clientLastName = clientLastName;
        return this;
    }

    public LocalDate getTrainingDate() {
        return trainingDate;
    }

    public TrainingResponse setTrainingDate(LocalDate trainingDate) {
        this.trainingDate = trainingDate;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainingResponse setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainingResponse setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public TrainingResponse setStatus(String status) {
        this.status = status;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public TrainingResponse setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }

    public String getClientNote() {
        return clientNote;
    }

    public TrainingResponse setClientNote(String clientNote) {
        this.clientNote = clientNote;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public TrainingResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public TrainingResponse setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }
}