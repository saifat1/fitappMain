package ru.fitapp.backend.dutyslot.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class TrainerDutySlotResponse {

    private Long id;
    private LocalDate dutyDate;
    private LocalTime startTime;
    private LocalTime endTime;

    public Long getId() {
        return id;
    }

    public TrainerDutySlotResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public LocalDate getDutyDate() {
        return dutyDate;
    }

    public TrainerDutySlotResponse setDutyDate(LocalDate dutyDate) {
        this.dutyDate = dutyDate;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerDutySlotResponse setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerDutySlotResponse setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }
}