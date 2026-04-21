package ru.fitapp.backend.availability.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityRulesResponse;
import ru.fitapp.backend.availability.dto.UpdateTrainerAvailabilityRulesRequest;
import ru.fitapp.backend.availability.service.TrainerAvailabilityService;

@RestController
@RequestMapping("/api/trainer/availability-rules")
public class TrainerAvailabilityController {

    private final TrainerAvailabilityService trainerAvailabilityService;

    public TrainerAvailabilityController(TrainerAvailabilityService trainerAvailabilityService) {
        this.trainerAvailabilityService = trainerAvailabilityService;
    }

    @GetMapping
    public TrainerAvailabilityRulesResponse getRules() {
        return trainerAvailabilityService.getRulesForCurrentTrainer();
    }

    @PutMapping
    public TrainerAvailabilityRulesResponse updateRules(@Valid @RequestBody UpdateTrainerAvailabilityRulesRequest request) {
        return trainerAvailabilityService.replaceRulesForCurrentTrainer(request);
    }
}
