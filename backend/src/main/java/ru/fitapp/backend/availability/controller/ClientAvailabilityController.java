package ru.fitapp.backend.availability.controller;

import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityCalendarResponse;
import ru.fitapp.backend.availability.service.TrainerAvailabilityService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/client/trainers")
public class ClientAvailabilityController {

    private final TrainerAvailabilityService trainerAvailabilityService;

    public ClientAvailabilityController(TrainerAvailabilityService trainerAvailabilityService) {
        this.trainerAvailabilityService = trainerAvailabilityService;
    }

    @GetMapping("/{trainerId}/availability")
    public TrainerAvailabilityCalendarResponse getAvailability(
            @PathVariable Long trainerId,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return trainerAvailabilityService.getCalendarForCurrentClient(trainerId, from, to);
    }
}
