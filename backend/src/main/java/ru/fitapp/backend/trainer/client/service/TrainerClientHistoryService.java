package ru.fitapp.backend.trainer.client.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.model.RepsMode;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.trainingexercise.entity.TrainingExercise;
import ru.fitapp.backend.trainingexercise.repository.TrainingExerciseRepository;
import ru.fitapp.backend.trainer.client.dto.ClientHistoryClientResponse;
import ru.fitapp.backend.trainer.client.dto.ClientHistoryExerciseResponse;
import ru.fitapp.backend.trainer.client.dto.ClientHistoryResponse;
import ru.fitapp.backend.trainer.client.dto.ClientHistoryTrainingResponse;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TrainerClientHistoryService {

    private final TrainerClientService trainerClientService;
    private final TrainingRepository trainingRepository;
    private final TrainingExerciseRepository trainingExerciseRepository;

    public TrainerClientHistoryService(
            TrainerClientService trainerClientService,
            TrainingRepository trainingRepository,
            TrainingExerciseRepository trainingExerciseRepository
    ) {
        this.trainerClientService = trainerClientService;
        this.trainingRepository = trainingRepository;
        this.trainingExerciseRepository = trainingExerciseRepository;
    }

    public ClientHistoryResponse getTrainerClientHistory(AppUser trainer, Long clientId) {
        AppUser client = trainerClientService.getClientOfTrainer(trainer.getId(), clientId);

        List<Training> trainings = trainingRepository
                .findAllByTrainerIdAndClientIdOrderByTrainingDateDescStartTimeDesc(
                        trainer.getId(),
                        clientId
                );

        return new ClientHistoryResponse()
                .setClient(mapClient(client))
                .setTrainings(trainings.stream().map(this::mapTraining).toList());
    }

    private ClientHistoryClientResponse mapClient(AppUser client) {
        return new ClientHistoryClientResponse()
                .setId(client.getId())
                .setEmail(client.getEmail())
                .setFirstName(client.getFirstName())
                .setLastName(client.getLastName())
                .setStatus(client.getStatus().name())
                .setCreatedByTrainer(client.isCreatedByTrainer())
                .setClaimedByClient(client.isClaimedByClient())
                .setClaimedAt(client.getClaimedAt());
    }

    private ClientHistoryTrainingResponse mapTraining(Training training) {
        List<ClientHistoryExerciseResponse> exercises = trainingExerciseRepository
                .findAllByTrainingIdOrderByOrderNumAsc(training.getId())
                .stream()
                .map(this::mapExercise)
                .toList();

        return new ClientHistoryTrainingResponse()
                .setId(training.getId())
                .setTrainingDate(training.getTrainingDate())
                .setStartTime(training.getStartTime())
                .setEndTime(training.getEndTime())
                .setStatus(training.getStatus().name())
                .setTrainerNote(training.getTrainerNote())
                .setClientNote(training.getClientNote())
                .setCreatedAt(training.getCreatedAt())
                .setUpdatedAt(training.getUpdatedAt())
                .setExercises(exercises);
    }

    private ClientHistoryExerciseResponse mapExercise(TrainingExercise exercise) {
        return new ClientHistoryExerciseResponse()
                .setId(exercise.getId())
                .setOrderNum(exercise.getOrderNum())
                .setTitle(exercise.getTitle())
                .setDescription(exercise.getDescription())
                .setSets(exercise.getSets())
                .setRepsMode(exercise.getRepsMode())
                .setRepsValue(exercise.getRepsValue())
                .setRepsFrom(exercise.getRepsFrom())
                .setRepsTo(exercise.getRepsTo())
                .setRepsDisplay(buildRepsDisplay(
                        exercise.getRepsMode(),
                        exercise.getRepsValue(),
                        exercise.getRepsFrom(),
                        exercise.getRepsTo()
                ))
                .setWeight(exercise.getWeight())
                .setDurationSeconds(exercise.getDurationSeconds())
                .setRestSeconds(exercise.getRestSeconds())
                .setIsCompleted(exercise.getIsCompleted())
                .setTrainerNote(exercise.getTrainerNote())
                .setClientNote(exercise.getClientNote())
                .setCreatedAt(exercise.getCreatedAt())
                .setUpdatedAt(exercise.getUpdatedAt());
    }

    private String buildRepsDisplay(
            RepsMode mode,
            Integer value,
            Integer from,
            Integer to
    ) {
        if (mode == null || mode == RepsMode.NONE) {
            return "—";
        }

        return switch (mode) {
            case EXACT -> value != null ? String.valueOf(value) : "—";
            case RANGE -> from != null && to != null ? from + "–" + to : "—";
            case NONE -> "—";
        };
    }
}