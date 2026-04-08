package ru.fitapp.backend.trainingexercise.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.service.TrainingService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.trainingexercise.dto.CreateTrainingExerciseRequest;
import ru.fitapp.backend.trainingexercise.dto.TrainingExerciseResponse;
import ru.fitapp.backend.trainingexercise.dto.UpdateExerciseCompletionRequest;
import ru.fitapp.backend.trainingexercise.dto.UpdateTrainingExerciseRequest;
import ru.fitapp.backend.trainingexercise.entity.TrainingExercise;
import ru.fitapp.backend.trainingexercise.repository.TrainingExerciseRepository;

import java.util.List;

@Service
@Transactional
public class TrainingExerciseService {

    private final TrainingExerciseRepository trainingExerciseRepository;
    private final TrainingService trainingService;
    private final CurrentUserService currentUserService;

    public TrainingExerciseService(TrainingExerciseRepository trainingExerciseRepository,
                                   TrainingService trainingService,
                                   CurrentUserService currentUserService) {
        this.trainingExerciseRepository = trainingExerciseRepository;
        this.trainingService = trainingService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<TrainingExerciseResponse> getExercises(Long trainingId) {
        trainingService.getAccessibleTrainingEntity(trainingId);

        return trainingExerciseRepository.findAllByTrainingIdOrderByOrderNumAsc(trainingId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TrainingExerciseResponse createExercise(Long trainingId, CreateTrainingExerciseRequest request) {
        Training training = trainingService.getTrainerOwnedTrainingEntity(trainingId);

        long currentCount = trainingExerciseRepository.countByTrainingId(trainingId);
        int nextOrderNum = (int) currentCount + 1;

        TrainingExercise exercise = new TrainingExercise()
                .setTraining(training)
                .setOrderNum(nextOrderNum)
                .setTitle(normalizeRequired(request.getTitle(), "Название упражнения обязательно"))
                .setDescription(normalizeOptional(request.getDescription()))
                .setSets(request.getSets())
                .setReps(request.getReps())
                .setDurationSeconds(request.getDurationSeconds())
                .setRestSeconds(request.getRestSeconds())
                .setTrainerNote(normalizeOptional(request.getTrainerNote()))
                .setIsCompleted(false);

        TrainingExercise saved = trainingExerciseRepository.save(exercise);
        return mapToResponse(saved);
    }

    public TrainingExerciseResponse updateExercise(Long trainingId,
                                                   Long exerciseId,
                                                   UpdateTrainingExerciseRequest request) {
        AppUser currentUser = currentUserService.getCurrentUser();
        Training training = trainingService.getAccessibleTrainingEntity(trainingId);
        TrainingExercise exercise = getExerciseOrThrow(trainingId, exerciseId);

        boolean isTrainerOwner = currentUser.getRole() == UserRole.TRAINER
                && training.getTrainer().getId().equals(currentUser.getId());

        boolean isClientOwner = currentUser.getRole() == UserRole.CLIENT
                && training.getClient().getId().equals(currentUser.getId());

        if (!isTrainerOwner && !isClientOwner) {
            throw new ApiException("ACCESS_DENIED", "Нет доступа к упражнению");
        }

        if (isTrainerOwner) {
            if (request.getTitle() != null) {
                exercise.setTitle(normalizeRequired(request.getTitle(), "Название упражнения обязательно"));
            }

            if (request.getDescription() != null) {
                exercise.setDescription(normalizeOptional(request.getDescription()));
            }

            if (request.getSets() != null) {
                exercise.setSets(request.getSets());
            }

            if (request.getReps() != null) {
                exercise.setReps(request.getReps());
            }

            if (request.getDurationSeconds() != null) {
                exercise.setDurationSeconds(request.getDurationSeconds());
            }

            if (request.getRestSeconds() != null) {
                exercise.setRestSeconds(request.getRestSeconds());
            }

            if (request.getTrainerNote() != null) {
                exercise.setTrainerNote(normalizeOptional(request.getTrainerNote()));
            }

            if (request.getOrderNum() != null) {
                exercise.setOrderNum(request.getOrderNum());
            }
        }

        if (request.getIsCompleted() != null) {
            exercise.setIsCompleted(request.getIsCompleted());
        }

        if (request.getClientNote() != null) {
            if (!isClientOwner && !isTrainerOwner) {
                throw new ApiException("ACCESS_DENIED", "Нет доступа к заметке клиента");
            }
            exercise.setClientNote(normalizeOptional(request.getClientNote()));
        }

        TrainingExercise saved = trainingExerciseRepository.save(exercise);
        return mapToResponse(saved);
    }

    public void deleteExercise(Long trainingId, Long exerciseId) {
        trainingService.getTrainerOwnedTrainingEntity(trainingId);
        TrainingExercise exercise = getExerciseOrThrow(trainingId, exerciseId);
        trainingExerciseRepository.delete(exercise);
    }

    public TrainingExerciseResponse updateCompletion(Long trainingId,
                                                     Long exerciseId,
                                                     UpdateExerciseCompletionRequest request) {
        trainingService.getAccessibleTrainingEntity(trainingId);
        TrainingExercise exercise = getExerciseOrThrow(trainingId, exerciseId);

        exercise.setIsCompleted(request.getIsCompleted());
        TrainingExercise saved = trainingExerciseRepository.save(exercise);

        return mapToResponse(saved);
    }

    private TrainingExercise getExerciseOrThrow(Long trainingId, Long exerciseId) {
        return trainingExerciseRepository.findByIdAndTrainingId(exerciseId, trainingId)
                .orElseThrow(() -> new ApiException("TRAINING_EXERCISE_NOT_FOUND", "Упражнение не найдено"));
    }

    private TrainingExerciseResponse mapToResponse(TrainingExercise exercise) {
        return new TrainingExerciseResponse()
                .setId(exercise.getId())
                .setTrainingId(exercise.getTraining().getId())
                .setOrderNum(exercise.getOrderNum())
                .setTitle(exercise.getTitle())
                .setDescription(exercise.getDescription())
                .setSets(exercise.getSets())
                .setReps(exercise.getReps())
                .setDurationSeconds(exercise.getDurationSeconds())
                .setRestSeconds(exercise.getRestSeconds())
                .setIsCompleted(exercise.getIsCompleted())
                .setTrainerNote(exercise.getTrainerNote())
                .setClientNote(exercise.getClientNote())
                .setCreatedAt(exercise.getCreatedAt())
                .setUpdatedAt(exercise.getUpdatedAt());
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new ApiException("VALIDATION_ERROR", message);
        }
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}