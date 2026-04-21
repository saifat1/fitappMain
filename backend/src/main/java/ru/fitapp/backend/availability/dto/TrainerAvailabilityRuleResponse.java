package ru.fitapp.backend.availability.dto;

import java.time.LocalTime;

public class TrainerAvailabilityRuleResponse {

    private Long id;
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDurationMinutes;
    private boolean active;

    public Long getId() {
        return id;
    }

    public TrainerAvailabilityRuleResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public Integer getDayOfWeek() {
        return dayOfWeek;
    }

    public TrainerAvailabilityRuleResponse setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerAvailabilityRuleResponse setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerAvailabilityRuleResponse setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public TrainerAvailabilityRuleResponse setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
        return this;
    }

    public boolean isActive() {
        return active;
    }

    public TrainerAvailabilityRuleResponse setActive(boolean active) {
        this.active = active;
        return this;
    }
}
