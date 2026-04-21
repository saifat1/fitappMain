package ru.fitapp.backend.availability.dto;

import ru.fitapp.backend.availability.model.AvailabilitySlotStatus;

import java.time.LocalDateTime;

public class TrainerAvailabilitySlotResponse {

    private LocalDateTime start;
    private LocalDateTime end;
    private AvailabilitySlotStatus status;

    public LocalDateTime getStart() {
        return start;
    }

    public TrainerAvailabilitySlotResponse setStart(LocalDateTime start) {
        this.start = start;
        return this;
    }

    public LocalDateTime getEnd() {
        return end;
    }

    public TrainerAvailabilitySlotResponse setEnd(LocalDateTime end) {
        this.end = end;
        return this;
    }

    public AvailabilitySlotStatus getStatus() {
        return status;
    }

    public TrainerAvailabilitySlotResponse setStatus(AvailabilitySlotStatus status) {
        this.status = status;
        return this;
    }
}
