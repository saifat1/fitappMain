package ru.fitapp.backend.availability.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class TrainerAvailabilityExceptionResponse {

    private Long id;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String comment;

    public Long getId() {
        return id;
    }

    public TrainerAvailabilityExceptionResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public LocalDate getDate() {
        return date;
    }

    public TrainerAvailabilityExceptionResponse setDate(LocalDate date) {
        this.date = date;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerAvailabilityExceptionResponse setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerAvailabilityExceptionResponse setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public String getComment() {
        return comment;
    }

    public TrainerAvailabilityExceptionResponse setComment(String comment) {
        this.comment = comment;
        return this;
    }
}