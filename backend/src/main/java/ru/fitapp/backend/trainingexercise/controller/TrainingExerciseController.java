package ru.fitapp.backend.trainingexercise.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.exercisetemplate.dto.ApplyExerciseTemplateRequest;
import ru.fitapp.backend.trainingexercise.dto.CreateTrainingExerciseRequest;
import ru.fitapp.backend.trainingexercise.dto.TrainingExerciseResponse;
import ru.fitapp.backend.trainingexercise.dto.UpdateExerciseCompletionRequest;
import ru.fitapp.backend.trainingexercise.dto.UpdateTrainingExerciseRequest;
import ru.fitapp.backend.trainingexercise.service.TrainingExerciseService;

import java.util.List;

@RestController
@RequestMapping("/api/trainings/{trainingId}/exercises")
public class TrainingExerciseController {

    private final TrainingExerciseService trainingExerciseService;

    public TrainingExerciseController(TrainingExerciseService trainingExerciseService) {
        this.trainingExerciseService = trainingExerciseService;
    }

    @GetMapping
    public List<TrainingExerciseResponse> getExercises(@PathVariable Long trainingId) {
        return trainingExerciseService.getExercises(trainingId);
    }

    @PostMapping
    public TrainingExerciseResponse createExercise(
            @PathVariable Long trainingId,
            @Valid @RequestBody CreateTrainingExerciseRequest request
    ) {
        return trainingExerciseService.createExercise(trainingId, request);
    }

    @PutMapping("/{exerciseId}")
    public TrainingExerciseResponse updateExercise(
            @PathVariable Long trainingId,
            @PathVariable Long exerciseId,
            @Valid @RequestBody UpdateTrainingExerciseRequest request
    ) {
        return trainingExerciseService.updateExercise(trainingId, exerciseId, request);
    }

    @DeleteMapping("/{exerciseId}")
    public void deleteExercise(
            @PathVariable Long trainingId,
            @PathVariable Long exerciseId
    ) {
        trainingExerciseService.deleteExercise(trainingId, exerciseId);
    }

    @PatchMapping("/{exerciseId}/completion")
    public TrainingExerciseResponse updateCompletion(
            @PathVariable Long trainingId,
            @PathVariable Long exerciseId,
            @Valid @RequestBody UpdateExerciseCompletionRequest request
    ) {
        return trainingExerciseService.updateCompletion(trainingId, exerciseId, request);
    }

    @PostMapping("/from-template")
    public TrainingExerciseResponse createExerciseFromTemplate(
            @PathVariable Long trainingId,
            @Valid @RequestBody ApplyExerciseTemplateRequest request
    ) {
        return trainingExerciseService.createExerciseFromTemplate(trainingId, request);
    }
}