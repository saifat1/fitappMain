package ru.fitapp.backend.training.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.training.dto.CreateClientTrainingRequest;
import ru.fitapp.backend.training.dto.TrainingResponse;
import ru.fitapp.backend.training.service.TrainingService;

/**
 * Client-facing training actions. Trainer-facing mutations live in
 * TrainingController under /api/trainings/**.
 */
@RestController
@RequestMapping("/api/client/trainings")
public class ClientTrainingController {

    private final TrainingService trainingService;

    public ClientTrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    /** FIT-77: a self-guided training the client writes down for themselves. */
    @PostMapping
    public TrainingResponse createMyTraining(@Valid @RequestBody CreateClientTrainingRequest request) {
        return trainingService.createForCurrentClient(request);
    }

    @PostMapping("/{trainingId}/cancel")
    public void cancelMyTraining(@PathVariable Long trainingId) {
        trainingService.cancelForCurrentClient(trainingId);
    }
}
