package ru.fitapp.backend.exercisetemplate.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.exercisetemplate.dto.CreateExerciseTemplateRequest;
import ru.fitapp.backend.exercisetemplate.dto.ExerciseTemplateResponse;
import ru.fitapp.backend.exercisetemplate.dto.UpdateExerciseTemplateRequest;
import ru.fitapp.backend.exercisetemplate.service.ExerciseTemplateService;

import java.util.List;

@RestController
@RequestMapping("/api/exercise-templates")
public class ExerciseTemplateController {

    private final ExerciseTemplateService exerciseTemplateService;

    public ExerciseTemplateController(ExerciseTemplateService exerciseTemplateService) {
        this.exerciseTemplateService = exerciseTemplateService;
    }

    @GetMapping
    public List<ExerciseTemplateResponse> getTemplates(
            @RequestParam(defaultValue = "false") boolean includeArchived
    ) {
        return exerciseTemplateService.getTemplates(includeArchived);
    }

    @GetMapping("/{templateId}")
    public ExerciseTemplateResponse getTemplate(@PathVariable Long templateId) {
        return exerciseTemplateService.getTemplate(templateId);
    }

    @PostMapping
    public ExerciseTemplateResponse createTemplate(
            @Valid @RequestBody CreateExerciseTemplateRequest request
    ) {
        return exerciseTemplateService.createTemplate(request);
    }

    @PutMapping("/{templateId}")
    public ExerciseTemplateResponse updateTemplate(
            @PathVariable Long templateId,
            @Valid @RequestBody UpdateExerciseTemplateRequest request
    ) {
        return exerciseTemplateService.updateTemplate(templateId, request);
    }

    @PatchMapping("/{templateId}/archive")
    public void archiveTemplate(@PathVariable Long templateId) {
        exerciseTemplateService.archiveTemplate(templateId);
    }

    @PatchMapping("/{templateId}/restore")
    public void restoreTemplate(@PathVariable Long templateId) {
        exerciseTemplateService.restoreTemplate(templateId);
    }
}