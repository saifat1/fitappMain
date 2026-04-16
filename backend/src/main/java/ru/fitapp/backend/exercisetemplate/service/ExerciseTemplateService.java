package ru.fitapp.backend.exercisetemplate.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
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
                .setReps(request.getReps())
                .setDurationSeconds(request.getDurationSeconds())
                .setRestSeconds(request.getRestSeconds())
                .setTrainerNote(normalizeOptional(request.getTrainerNote()))
                .setIsArchived(false);

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
                .setReps(request.getReps())
                .setDurationSeconds(request.getDurationSeconds())
                .setRestSeconds(request.getRestSeconds())
                .setTrainerNote(normalizeOptional(request.getTrainerNote()));

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
                .setReps(template.getReps())
                .setDurationSeconds(template.getDurationSeconds())
                .setRestSeconds(template.getRestSeconds())
                .setTrainerNote(template.getTrainerNote())
                .setIsArchived(template.getIsArchived())
                .setCreatedAt(template.getCreatedAt())
                .setUpdatedAt(template.getUpdatedAt());
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