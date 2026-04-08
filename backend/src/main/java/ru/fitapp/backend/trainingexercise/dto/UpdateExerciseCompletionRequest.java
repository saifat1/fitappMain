package ru.fitapp.backend.trainingexercise.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateExerciseCompletionRequest {

    @NotNull(message = "Флаг выполнения обязателен")
    private Boolean isCompleted;

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public UpdateExerciseCompletionRequest setIsCompleted(Boolean completed) {
        isCompleted = completed;
        return this;
    }
}