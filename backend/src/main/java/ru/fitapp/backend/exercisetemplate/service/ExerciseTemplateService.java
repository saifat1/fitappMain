package ru.fitapp.backend.exercisetemplate.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.model.RepsMode;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.exercisetemplate.dto.CreateExerciseTemplateRequest;
import ru.fitapp.backend.exercisetemplate.dto.ExerciseTemplateResponse;
import ru.fitapp.backend.exercisetemplate.dto.UpdateExerciseTemplateRequest;
import ru.fitapp.backend.exercisetemplate.entity.ExerciseTemplate;
import ru.fitapp.backend.exercisetemplate.repository.ExerciseTemplateRepository;
import ru.fitapp.backend.user.entity.AppUser;

import java.util.List;

@Service
@Transactional
public class ExerciseTemplateService {

    private final ExerciseTemplateRepository exerciseTemplateRepository;
    private final CurrentUserService currentUserService;

    public ExerciseTemplateService(
            ExerciseTemplateRepository exerciseTemplateRepository,
            CurrentUserService currentUserService
    ) {
        this.exerciseTemplateRepository = exerciseTemplateRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<ExerciseTemplateResponse> getTemplates(boolean includeArchived) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        List<ExerciseTemplate> templates = includeArchived
                ? exerciseTemplateRepository.findAllByTrainerIdOrderByNameAsc(trainer.getId())
                : exerciseTemplateRepository.findAllByTrainerIdAndIsArchivedOrderByNameAsc(
                trainer.getId(),
                false
        );

        return templates.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExerciseTemplateResponse getTemplate(Long templateId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        ExerciseTemplate template = getTrainerOwnedTemplateOrThrow(templateId, trainer.getId());
        return mapToResponse(template);
    }

    public ExerciseTemplateResponse createTemplate(CreateExerciseTemplateRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        ExerciseTemplate template = new ExerciseTemplate()
                .setTrainer(trainer)
                .setName(normalizeRequired(request.getName(), "Название шаблона обязательно"))
                .setDescription(normalizeOptional(request.getDescription()))
                .setSets(request.getSets())
                .setDurationSeconds(request.getDurationSeconds())
                .setRestSeconds(request.getRestSeconds())
                .setTrainerNote(normalizeOptional(request.getTrainerNote()))
                .setIsArchived(false);

        applyReps(
                template,
                request.getRepsMode(),
                request.getRepsValue(),
                request.getRepsFrom(),
                request.getRepsTo()
        );

        ExerciseTemplate saved = exerciseTemplateRepository.save(template);
        return mapToResponse(saved);
    }

    public ExerciseTemplateResponse updateTemplate(
            Long templateId,
            UpdateExerciseTemplateRequest request
    ) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        ExerciseTemplate template = getTrainerOwnedTemplateOrThrow(templateId, trainer.getId());

        template
                .setName(normalizeRequired(request.getName(), "Название шаблона обязательно"))
                .setDescription(normalizeOptional(request.getDescription()))
                .setSets(request.getSets())
                .setDurationSeconds(request.getDurationSeconds())
                .setRestSeconds(request.getRestSeconds())
                .setTrainerNote(normalizeOptional(request.getTrainerNote()));

        applyReps(
                template,
                request.getRepsMode(),
                request.getRepsValue(),
                request.getRepsFrom(),
                request.getRepsTo()
        );

        ExerciseTemplate saved = exerciseTemplateRepository.save(template);
        return mapToResponse(saved);
    }

    public void archiveTemplate(Long templateId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        ExerciseTemplate template = getTrainerOwnedTemplateOrThrow(templateId, trainer.getId());
        template.setIsArchived(true);
        exerciseTemplateRepository.save(template);
    }

    public void restoreTemplate(Long templateId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        ExerciseTemplate template = getTrainerOwnedTemplateOrThrow(templateId, trainer.getId());
        template.setIsArchived(false);
        exerciseTemplateRepository.save(template);
    }

    @Transactional(readOnly = true)
    public ExerciseTemplate getActiveTemplateEntity(Long templateId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        ExerciseTemplate template = getTrainerOwnedTemplateOrThrow(templateId, trainer.getId());

        if (Boolean.TRUE.equals(template.getIsArchived())) {
            throw new ApiException(
                    "EXERCISE_TEMPLATE_ARCHIVED",
                    "Нельзя использовать архивный шаблон упражнения"
            );
        }

        return template;
    }

    private ExerciseTemplate getTrainerOwnedTemplateOrThrow(Long templateId, Long trainerId) {
        return exerciseTemplateRepository.findByIdAndTrainerId(templateId, trainerId)
                .orElseThrow(() -> new ApiException(
                        "EXERCISE_TEMPLATE_NOT_FOUND",
                        "Шаблон упражнения не найден"
                ));
    }

    private ExerciseTemplateResponse mapToResponse(ExerciseTemplate template) {
        return new ExerciseTemplateResponse()
                .setId(template.getId())
                .setTrainerId(template.getTrainer().getId())
                .setName(template.getName())
                .setDescription(template.getDescription())
                .setSets(template.getSets())
                .setRepsMode(template.getRepsMode())
                .setRepsValue(template.getRepsValue())
                .setRepsFrom(template.getRepsFrom())
                .setRepsTo(template.getRepsTo())
                .setRepsDisplay(buildRepsDisplay(
                        template.getRepsMode(),
                        template.getRepsValue(),
                        template.getRepsFrom(),
                        template.getRepsTo()
                ))
                .setDurationSeconds(template.getDurationSeconds())
                .setRestSeconds(template.getRestSeconds())
                .setTrainerNote(template.getTrainerNote())
                .setIsArchived(template.getIsArchived())
                .setCreatedAt(template.getCreatedAt())
                .setUpdatedAt(template.getUpdatedAt());
    }

    private void applyReps(
            ExerciseTemplate template,
            RepsMode mode,
            Integer value,
            Integer from,
            Integer to
    ) {
        RepsMode resolvedMode = resolveRepsMode(mode, value, from, to);
        validateReps(resolvedMode, value, from, to);

        template
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
}