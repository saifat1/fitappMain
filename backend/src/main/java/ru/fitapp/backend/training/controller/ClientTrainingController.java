package ru.fitapp.backend.training.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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

    @PostMapping("/{trainingId}/cancel")
    public void cancelMyTraining(@PathVariable Long trainingId) {
        trainingService.cancelForCurrentClient(trainingId);
    }
}
