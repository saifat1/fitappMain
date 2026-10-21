package ru.fitapp.backend.availability.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class TrainerAvailabilityExceptionRequest {

    @NotNull(message = "date обязательно")
    private LocalDate date;

    /** Optional last day of a multi-day closure; null — single day. */
    private LocalDate endDate;

    @NotNull(message = "startTime обязательно")
    private LocalTime startTime;

    @NotNull(message = "endTime обязательно")
    private LocalTime endTime;

    @Size(max = 500, message = "Комментарий не должен быть длиннее 500 символов")
    private String comment;

    public LocalDate getEndDate() {
        return endDate;
    }

    public TrainerAvailabilityExceptionRequest setEndDate(LocalDate endDate) {
        this.endDate = endDate;
        return this;
    }

    public LocalDate getDate() {
        return date;
    }

    public TrainerAvailabilityExceptionRequest setDate(LocalDate date) {
        this.date = date;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerAvailabilityExceptionRequest setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerAvailabilityExceptionRequest setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public String getComment() {
        return comment;
    }

    public TrainerAvailabilityExceptionRequest setComment(String comment) {
        this.comment = comment;
        return this;
    }
}