package ru.fitapp.backend.training.controller;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.training.dto.CreateTrainingRequest;
import ru.fitapp.backend.training.dto.TrainingResponse;
import ru.fitapp.backend.training.dto.UpdateTrainingRequest;
import ru.fitapp.backend.training.service.TrainingService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trainings")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @GetMapping
    public List<TrainingResponse> getTrainings(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return trainingService.getTrainings(from, to);
    }

    @GetMapping("/{trainingId}")
    public TrainingResponse getTraining(@PathVariable Long trainingId) {
        return trainingService.getTraining(trainingId);
    }

    @PostMapping
    public TrainingResponse createTraining(@Valid @RequestBody CreateTrainingRequest request) {
        return trainingService.createTraining(request);
    }

    @PutMapping("/{trainingId}")
    public TrainingResponse updateTraining(
            @PathVariable Long trainingId,
            @Valid @RequestBody UpdateTrainingRequest request
    ) {
        return trainingService.updateTraining(trainingId, request);
    }

    @DeleteMapping("/{trainingId}")
    public void cancelTraining(@PathVariable Long trainingId) {
        trainingService.cancelTraining(trainingId);
    }

    @PatchMapping("/{trainingId}/cancel")
    public void cancelTrainingPatch(@PathVariable Long trainingId) {
        trainingService.cancelTraining(trainingId);
    }

    @PatchMapping("/{trainingId}/complete")
    public TrainingResponse completeTraining(@PathVariable Long trainingId) {
        return trainingService.completeTraining(trainingId);
    }
}