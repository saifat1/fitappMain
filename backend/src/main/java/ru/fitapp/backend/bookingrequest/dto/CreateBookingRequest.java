package ru.fitapp.backend.bookingrequest.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class CreateBookingRequest {

    @NotNull(message = "trainerId обязателен")
    private Long trainerId;

    @NotNull(message = "requestedStart обязателен")
    private LocalDateTime requestedStart;

    @NotNull(message = "requestedEnd обязателен")
    private LocalDateTime requestedEnd;

    @Size(max = 2000, message = "Комментарий клиента не должен быть длиннее 2000 символов")
    private String clientComment;

    public Long getTrainerId() {
        return trainerId;
    }

    public CreateBookingRequest setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
        return this;
    }

    public LocalDateTime getRequestedStart() {
        return requestedStart;
    }

    public CreateBookingRequest setRequestedStart(LocalDateTime requestedStart) {
        this.requestedStart = requestedStart;
        return this;
    }

    public LocalDateTime getRequestedEnd() {
        return requestedEnd;
    }

    public CreateBookingRequest setRequestedEnd(LocalDateTime requestedEnd) {
        this.requestedEnd = requestedEnd;
        return this;
    }

    public String getClientComment() {
        return clientComment;
    }

    public CreateBookingRequest setClientComment(String clientComment) {
        this.clientComment = clientComment;
        return this;
    }
}
