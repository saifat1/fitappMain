package ru.fitapp.backend.trainingexercise.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.model.RepsMode;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.exercisetemplate.dto.ApplyExerciseTemplateRequest;
import ru.fitapp.backend.exercisetemplate.entity.ExerciseTemplate;
import ru.fitapp.backend.exercisetemplate.service.ExerciseTemplateService;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.service.TrainingService;
import ru.fitapp.backend.trainingexercise.dto.CreateTrainingExerciseRequest;
import ru.fitapp.backend.trainingexercise.dto.TrainingExerciseResponse;
import ru.fitapp.backend.trainingexercise.dto.UpdateExerciseCompletionRequest;
import ru.fitapp.backend.trainingexercise.dto.UpdateTrainingExerciseRequest;
import ru.fitapp.backend.trainingexercise.entity.TrainingExercise;
import ru.fitapp.backend.trainingexercise.repository.TrainingExerciseRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional
public class TrainingExerciseService {

    private final TrainingExerciseRepository trainingExerciseRepository;
    private final TrainingService trainingService;
    private final CurrentUserService currentUserService;
    private final ExerciseTemplateService exerciseTemplateService;

    public TrainingExerciseService(
            TrainingExerciseRepository trainingExerciseRepository,
            TrainingService trainingService,
            CurrentUserService currentUserService,
            ExerciseTemplateService exerciseTemplateService
    ) {
        this.trainingExerciseRepository = trainingExerciseRepository;
        this.trainingService = trainingService;
        this.currentUserService = currentUserService;
        this.exerciseTemplateService = exerciseTemplateService;
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

        TrainingExercise exercise = new TrainingExercise()
                .setTraining(training)
                .setOrderNum(getNextOrderNum(trainingId))
                .setTitle(normalizeRequired(request.getTitle(), "Название упражнения обязательно"))
                .setDescription(normalizeOptional(request.getDescription()))
                .setSets(request.getSets())
                .setWeight(normalizeWeight(request.getWeight()))
                .setDurationSeconds(request.getDurationSeconds())
                .setRestSeconds(request.getRestSeconds())
                .setTrainerNote(normalizeOptional(request.getTrainerNote()))
                .setIsCompleted(false);

        applyReps(
                exercise,
                request.getRepsMode(),
                request.getRepsValue(),
                request.getRepsFrom(),
                request.getRepsTo()
        );

        TrainingExercise saved = trainingExerciseRepository.save(exercise);
        return mapToResponse(saved);
    }

    public TrainingExerciseResponse createExerciseFromTemplate(
            Long trainingId,
            ApplyExerciseTemplateRequest request
    ) {
        Training training = trainingService.getTrainerOwnedTrainingEntity(trainingId);
        ExerciseTemplate template = exerciseTemplateService.getActiveTemplateEntity(request.getTemplateId());

        TrainingExercise exercise = new TrainingExercise()
                .setTraining(training)
                .setOrderNum(getNextOrderNum(trainingId))
                .setTitle(normalizeRequired(template.getName(), "Название упражнения обязательно"))
                .setDescription(normalizeOptional(template.getDescription()))
                .setSets(template.getSets())
                .setWeight(template.getWeight())
                .setDurationSeconds(template.getDurationSeconds())
                .setRestSeconds(template.getRestSeconds())
                .setTrainerNote(normalizeOptional(template.getTrainerNote()))
                .setIsCompleted(false);

        applyReps(
                exercise,
                template.getRepsMode(),
                template.getRepsValue(),
                template.getRepsFrom(),
                template.getRepsTo()
        );

        TrainingExercise saved = trainingExerciseRepository.save(exercise);
        return mapToResponse(saved);
    }

    public TrainingExerciseResponse updateExercise(
            Long trainingId,
            Long exerciseId,
            UpdateTrainingExerciseRequest request
    ) {
        AppUser currentUser = currentUserService.getCurrentUser();
        Training training = trainingService.getAccessibleTrainingEntity(trainingId);
        TrainingExercise exercise = getExerciseOrThrow(trainingId, exerciseId);

        boolean isTrainerOwner =
                currentUser.getRole() == UserRole.TRAINER
                        && training.getTrainer().getId().equals(currentUser.getId());

        boolean isClientOwner =
                currentUser.getRole() == UserRole.CLIENT
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

            if (hasRepsPayload(request)) {
                applyReps(
                        exercise,
                        request.getRepsMode(),
                        request.getRepsValue(),
                        request.getRepsFrom(),
                        request.getRepsTo()
                );
            }

            if (request.getWeight() != null) {
                exercise.setWeight(normalizeWeight(request.getWeight()));
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

    public TrainingExerciseResponse updateCompletion(
            Long trainingId,
            Long exerciseId,
            UpdateExerciseCompletionRequest request
    ) {
        trainingService.getAccessibleTrainingEntity(trainingId);
        TrainingExercise exercise = getExerciseOrThrow(trainingId, exerciseId);
        exercise.setIsCompleted(request.getIsCompleted());

        TrainingExercise saved = trainingExerciseRepository.save(exercise);
        return mapToResponse(saved);
    }

    private int getNextOrderNum(Long trainingId) {
        return trainingExerciseRepository.findTopByTrainingIdOrderByOrderNumDesc(trainingId)
                .map(item -> item.getOrderNum() + 1)
                .orElse(1);
    }

    private TrainingExercise getExerciseOrThrow(Long trainingId, Long exerciseId) {
        return trainingExerciseRepository.findByIdAndTrainingId(exerciseId, trainingId)
                .orElseThrow(() -> new ApiException(
                        "TRAINING_EXERCISE_NOT_FOUND",
                        "Упражнение не найдено"
                ));
    }

    private TrainingExerciseResponse mapToResponse(TrainingExercise exercise) {
        return new TrainingExerciseResponse()
                .setId(exercise.getId())
                .setTrainingId(exercise.getTraining().getId())
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

    private boolean hasRepsPayload(UpdateTrainingExerciseRequest request) {
        return request.getRepsMode() != null
                || request.getRepsValue() != null
                || request.getRepsFrom() != null
                || request.getRepsTo() != null;
    }

    private void applyReps(
            TrainingExercise exercise,
            RepsMode mode,
            Integer value,
            Integer from,
            Integer to
    ) {
        RepsMode resolvedMode = resolveRepsMode(mode, value, from, to);
        validateReps(resolvedMode, value, from, to);

        exercise
                .setRepsMode(resolvedMode)
                .setRepsValue(resolvedMode == RepsMode.EXACT ? value : null)
                .setRepsFrom(resolvedMode == RepsMode.RANGE ? from : null)
                .setRepsTo(resolvedMode == RepsMode.RANGE ? to : null);
    }

    private RepsMode resolveRepsMode(
            RepsMode mode,
            Integer value,
            Integer from,
            Integer to
    ) {
        boolean hasAnyValue = value != null || from != null || to != null;

        if (mode == null) {
            return hasAnyValue ? null : RepsMode.NONE;
        }

        return mode;
    }

    private void validateReps(
            RepsMode mode,
            Integer value,
            Integer from,
            Integer to
    ) {
        if (mode == null) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "Не указан режим повторений"
            );
        }

        switch (mode) {
            case NONE -> {
                if (value != null || from != null || to != null) {
                    throw new ApiException(
                            "VALIDATION_ERROR",
                            "Для режима без повторений нельзя заполнять значения повторений"
                    );
                }
            }
            case EXACT -> {
                if (value == null || value < 1) {
                    throw new ApiException(
                            "VALIDATION_ERROR",
                            "Для точного значения повторений нужно указать положительное число"
                    );
                }

                if (from != null || to != null) {
                    throw new ApiException(
                            "VALIDATION_ERROR",
                            "Для точного значения повторений нельзя заполнять диапазон"
                    );
                }
            }
            case RANGE -> {
                if (from == null || to == null || from < 1 || to < 1) {
                    throw new ApiException(
                            "VALIDATION_ERROR",
                            "Для диапазона повторений нужно указать две положительные границы"
                    );
                }

                if (from > to) {
                    throw new ApiException(
                            "VALIDATION_ERROR",
                            "Нижняя граница повторений не может быть больше верхней"
                    );
                }

                if (value != null) {
                    throw new ApiException(
                            "VALIDATION_ERROR",
                            "Для диапазона повторений нельзя заполнять точное значение"
                    );
                }
            }
        }
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

    private BigDecimal normalizeWeight(BigDecimal value) {
        if (value == null) {
            return null;
        }

        if (value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException("VALIDATION_ERROR", "Вес должен быть больше 0");
        }

        return value.setScale(2, RoundingMode.HALF_UP);
    }
}