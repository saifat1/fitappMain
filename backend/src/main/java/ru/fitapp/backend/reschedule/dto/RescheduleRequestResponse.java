package ru.fitapp.backend.reschedule.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class RescheduleRequestResponse {

    private Long id;
    private Long trainingId;
    private Long requesterId;
    private String requesterEmail;
    private LocalDate requestedTrainingDate;
    private LocalTime requestedStartTime;
    private LocalTime requestedEndTime;
    private String clientComment;
    private String trainerComment;
    private String status;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public RescheduleRequestResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public RescheduleRequestResponse setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
        return this;
    }

    public Long getRequesterId() {
        return requesterId;
    }

    public RescheduleRequestResponse setRequesterId(Long requesterId) {
        this.requesterId = requesterId;
        return this;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public RescheduleRequestResponse setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
        return this;
    }

    public LocalDate getRequestedTrainingDate() {
        return requestedTrainingDate;
    }

    public RescheduleRequestResponse setRequestedTrainingDate(LocalDate requestedTrainingDate) {
        this.requestedTrainingDate = requestedTrainingDate;
        return this;
    }

    public LocalTime getRequestedStartTime() {
        return requestedStartTime;
    }

    public RescheduleRequestResponse setRequestedStartTime(LocalTime requestedStartTime) {
        this.requestedStartTime = requestedStartTime;
        return this;
    }

    public LocalTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public RescheduleRequestResponse setRequestedEndTime(LocalTime requestedEndTime) {
        this.requestedEndTime = requestedEndTime;
        return this;
    }

    public String getClientComment() {
        return clientComment;
    }

    public RescheduleRequestResponse setClientComment(String clientComment) {
        this.clientComment = clientComment;
        return this;
    }

    public String getTrainerComment() {
        return trainerComment;
    }

    public RescheduleRequestResponse setTrainerComment(String trainerComment) {
        this.trainerComment = trainerComment;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public RescheduleRequestResponse setStatus(String status) {
        this.status = status;
        return this;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public RescheduleRequestResponse setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public RescheduleRequestResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public RescheduleRequestResponse setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }
}