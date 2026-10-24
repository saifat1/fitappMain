package ru.fitapp.backend.progress.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.progress.dto.ExerciseProgressDtos.Previous;
import ru.fitapp.backend.progress.dto.ExerciseProgressDtos.Series;
import ru.fitapp.backend.progress.dto.ExerciseProgressDtos.Summary;
import ru.fitapp.backend.progress.service.ExerciseProgressService;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.service.TrainingService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;

import java.util.List;

/** FIT-76: exercise progress — the trainer about a client, the client about themselves, the «в прошлый раз» hint. */
@RestController
public class ExerciseProgressController {

    private final ExerciseProgressService exerciseProgressService;
    private final CurrentUserService currentUserService;
    private final TrainerClientService trainerClientService;
    private final TrainingService trainingService;

    public ExerciseProgressController(
            ExerciseProgressService exerciseProgressService,
            CurrentUserService currentUserService,
            TrainerClientService trainerClientService,
            TrainingService trainingService
    ) {
        this.exerciseProgressService = exerciseProgressService;
        this.currentUserService = currentUserService;
        this.trainerClientService = trainerClientService;
        this.trainingService = trainingService;
    }

    @GetMapping("/api/trainer/clients/{clientId}/progress")
    public List<Summary> trainerSummaries(@PathVariable Long clientId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return exerciseProgressService.getSummaries(clientId);
    }

    @GetMapping("/api/trainer/clients/{clientId}/progress/series")
    public Series trainerSeries(@PathVariable Long clientId, @RequestParam String key) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return exerciseProgressService.getSeries(clientId, key).orElseThrow(ExerciseProgressController::notFound);
    }

    /** «В прошлый раз» on the «Новая тренировка» screen, before the training exists. Empty body — not done yet. */
    @GetMapping("/api/trainer/clients/{clientId}/progress/previous")
    public Previous trainerPrevious(@PathVariable Long clientId, @RequestParam String title) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return exerciseProgressService.getLatest(clientId, title).orElse(null);
    }

    @GetMapping("/api/client/progress")
    public List<Summary> mySummaries() {
        return exerciseProgressService.getSummaries(currentClient().getId());
    }

    @GetMapping("/api/client/progress/series")
    public Series mySeries(@RequestParam String key) {
        return exerciseProgressService.getSeries(currentClient().getId(), key).orElseThrow(ExerciseProgressController::notFound);
    }

    /** Empty body when the client hasn't done this exercise before. */
    @GetMapping("/api/trainings/{trainingId}/exercises/previous")
    public Previous previous(@PathVariable Long trainingId, @RequestParam String title) {
        Training training = trainingService.getAccessibleTrainingEntity(trainingId);
        return exerciseProgressService.getPrevious(training, title).orElse(null);
    }

    private AppUser currentClient() {
        AppUser user = currentUserService.getCurrentUser();
        if (user.getRole() != UserRole.CLIENT) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только клиенту");
        }
        return user;
    }

    private static ApiException notFound() {
        return new ApiException("EXERCISE_NOT_FOUND", "Упражнение не найдено в проведённых тренировках");
    }
}
