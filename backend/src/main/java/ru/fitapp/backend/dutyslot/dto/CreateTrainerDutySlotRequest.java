package ru.fitapp.backend.dutyslot.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class CreateTrainerDutySlotRequest {

    @NotNull(message = "Дата дежурства обязательна")
    private LocalDate dutyDate;

    @NotNull(message = "Время начала обязательно")
    private LocalTime startTime;

    @NotNull(message = "Время окончания обязательно")
    private LocalTime endTime;

    public LocalDate getDutyDate() {
        return dutyDate;
    }

    public CreateTrainerDutySlotRequest setDutyDate(LocalDate dutyDate) {
        this.dutyDate = dutyDate;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public CreateTrainerDutySlotRequest setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public CreateTrainerDutySlotRequest setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }
}