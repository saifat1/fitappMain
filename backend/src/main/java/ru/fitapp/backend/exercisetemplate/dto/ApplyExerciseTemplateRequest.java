package ru.fitapp.backend.exercisetemplate.dto;

import jakarta.validation.constraints.NotNull;

public class ApplyExerciseTemplateRequest {

    @NotNull(message = "templateId обязателен")
    private Long templateId;

    public Long getTemplateId() {
        return templateId;
    }

    public ApplyExerciseTemplateRequest setTemplateId(Long templateId) {
        this.templateId = templateId;
        return this;
    }
}