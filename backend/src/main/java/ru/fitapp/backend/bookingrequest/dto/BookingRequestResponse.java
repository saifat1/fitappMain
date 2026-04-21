package ru.fitapp.backend.bookingrequest.dto;

import java.time.LocalDateTime;

public class BookingRequestResponse {

    private Long id;
    private Long trainerId;
    private String trainerEmail;
    private String trainerFirstName;
    private String trainerLastName;
    private Long clientId;
    private String clientEmail;
    private String clientFirstName;
    private String clientLastName;
    private LocalDateTime requestedStart;
    private LocalDateTime requestedEnd;
    private String status;
    private String clientComment;
    private String trainerComment;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public BookingRequestResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getTrainerId() {
        return trainerId;
    }

    public BookingRequestResponse setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
        return this;
    }

    public String getTrainerEmail() {
        return trainerEmail;
    }

    public BookingRequestResponse setTrainerEmail(String trainerEmail) {
        this.trainerEmail = trainerEmail;
        return this;
    }

    public String getTrainerFirstName() {
        return trainerFirstName;
    }

    public BookingRequestResponse setTrainerFirstName(String trainerFirstName) {
        this.trainerFirstName = trainerFirstName;
        return this;
    }

    public String getTrainerLastName() {
        return trainerLastName;
    }

    public BookingRequestResponse setTrainerLastName(String trainerLastName) {
        this.trainerLastName = trainerLastName;
        return this;
    }

    public Long getClientId() {
        return clientId;
    }

    public BookingRequestResponse setClientId(Long clientId) {
        this.clientId = clientId;
        return this;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public BookingRequestResponse setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
        return this;
    }

    public String getClientFirstName() {
        return clientFirstName;
    }

    public BookingRequestResponse setClientFirstName(String clientFirstName) {
        this.clientFirstName = clientFirstName;
        return this;
    }

    public String getClientLastName() {
        return clientLastName;
    }

    public BookingRequestResponse setClientLastName(String clientLastName) {
        this.clientLastName = clientLastName;
        return this;
    }

    public LocalDateTime getRequestedStart() {
        return requestedStart;
    }

    public BookingRequestResponse setRequestedStart(LocalDateTime requestedStart) {
        this.requestedStart = requestedStart;
        return this;
    }

    public LocalDateTime getRequestedEnd() {
        return requestedEnd;
    }

    public BookingRequestResponse setRequestedEnd(LocalDateTime requestedEnd) {
        this.requestedEnd = requestedEnd;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public BookingRequestResponse setStatus(String status) {
        this.status = status;
        return this;
    }

    public String getClientComment() {
        return clientComment;
    }

    public BookingRequestResponse setClientComment(String clientComment) {
        this.clientComment = clientComment;
        return this;
    }

    public String getTrainerComment() {
        return trainerComment;
    }

    public BookingRequestResponse setTrainerComment(String trainerComment) {
        this.trainerComment = trainerComment;
        return this;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public BookingRequestResponse setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public BookingRequestResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public BookingRequestResponse setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }
}
