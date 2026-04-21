package ru.fitapp.backend.availability.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class TrainerAvailabilityExceptionRequest {

    @NotNull(message = "date обязательно")
    private LocalDate date;

    @NotNull(message = "startTime обязательно")
    private LocalTime startTime;

    @NotNull(message = "endTime обязательно")
    private LocalTime endTime;

    private String comment;

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