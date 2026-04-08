package ru.fitapp.backend.reschedule.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class CreateRescheduleRequestRequest {

    @NotNull(message = "Новая дата обязательна")
    private LocalDate requestedTrainingDate;

    private LocalTime requestedStartTime;

    private LocalTime requestedEndTime;

    @Size(max = 2000, message = "Комментарий клиента не должен быть длиннее 2000 символов")
    private String clientComment;

    public LocalDate getRequestedTrainingDate() {
        return requestedTrainingDate;
    }

    public CreateRescheduleRequestRequest setRequestedTrainingDate(LocalDate requestedTrainingDate) {
        this.requestedTrainingDate = requestedTrainingDate;
        return this;
    }

    public LocalTime getRequestedStartTime() {
        return requestedStartTime;
    }

    public CreateRescheduleRequestRequest setRequestedStartTime(LocalTime requestedStartTime) {
        this.requestedStartTime = requestedStartTime;
        return this;
    }

    public LocalTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public CreateRescheduleRequestRequest setRequestedEndTime(LocalTime requestedEndTime) {
        this.requestedEndTime = requestedEndTime;
        return this;
    }

    public String getClientComment() {
        return clientComment;
    }

    public CreateRescheduleRequestRequest setClientComment(String clientComment) {
        this.clientComment = clientComment;
        return this;
    }
}