package ru.fitapp.backend.availability.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public class TrainerAvailabilityRuleRequest {

    @NotNull(message = "dayOfWeek обязателен")
    @Min(value = 1, message = "dayOfWeek должен быть от 1 до 7")
    @Max(value = 7, message = "dayOfWeek должен быть от 1 до 7")
    private Integer dayOfWeek;

    @NotNull(message = "startTime обязателен")
    private LocalTime startTime;

    @NotNull(message = "endTime обязателен")
    private LocalTime endTime;

    @NotNull(message = "slotDurationMinutes обязателен")
    @Min(value = 15, message = "slotDurationMinutes должен быть не меньше 15")
    private Integer slotDurationMinutes;

    @NotNull(message = "active обязателен")
    private Boolean active;

    public Integer getDayOfWeek() {
        return dayOfWeek;
    }

    public TrainerAvailabilityRuleRequest setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerAvailabilityRuleRequest setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerAvailabilityRuleRequest setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public TrainerAvailabilityRuleRequest setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
        return this;
    }

    public Boolean getActive() {
        return active;
    }

    public TrainerAvailabilityRuleRequest setActive(Boolean active) {
        this.active = active;
        return this;
    }
}
