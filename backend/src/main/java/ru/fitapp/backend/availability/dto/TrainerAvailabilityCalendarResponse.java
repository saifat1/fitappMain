package ru.fitapp.backend.availability.dto;

import java.time.LocalDate;
import java.util.List;

public class TrainerAvailabilityCalendarResponse {

    private Long trainerId;
    private LocalDate from;
    private LocalDate to;
    private List<TrainerAvailabilitySlotResponse> slots;

    public Long getTrainerId() {
        return trainerId;
    }

    public TrainerAvailabilityCalendarResponse setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
        return this;
    }

    public LocalDate getFrom() {
        return from;
    }

    public TrainerAvailabilityCalendarResponse setFrom(LocalDate from) {
        this.from = from;
        return this;
    }

    public LocalDate getTo() {
        return to;
    }

    public TrainerAvailabilityCalendarResponse setTo(LocalDate to) {
        this.to = to;
        return this;
    }

    public List<TrainerAvailabilitySlotResponse> getSlots() {
        return slots;
    }

    public TrainerAvailabilityCalendarResponse setSlots(List<TrainerAvailabilitySlotResponse> slots) {
        this.slots = slots;
        return this;
    }
}
