package ru.fitapp.backend.availability.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityExceptionRequest;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityExceptionResponse;
import ru.fitapp.backend.availability.service.TrainerAvailabilityService;

/** Single closed intervals managed straight from the trainer's calendar (the full list is edited via availability-rules). */
@RestController
@RequestMapping("/api/trainer/availability-exceptions")
public class TrainerAvailabilityExceptionController {

    private final TrainerAvailabilityService trainerAvailabilityService;

    public TrainerAvailabilityExceptionController(TrainerAvailabilityService trainerAvailabilityService) {
        this.trainerAvailabilityService = trainerAvailabilityService;
    }

    @PostMapping
    public TrainerAvailabilityExceptionResponse create(@Valid @RequestBody TrainerAvailabilityExceptionRequest request) {
        return trainerAvailabilityService.addExceptionForCurrentTrainer(request);
    }

    @DeleteMapping("/{exceptionId}")
    public void delete(@PathVariable Long exceptionId) {
        trainerAvailabilityService.deleteExceptionForCurrentTrainer(exceptionId);
    }
}
