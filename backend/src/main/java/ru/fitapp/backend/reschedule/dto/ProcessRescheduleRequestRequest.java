package ru.fitapp.backend.reschedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProcessRescheduleRequestRequest {

    @NotBlank(message = "Решение обязательно")
    private String decision;

    @Size(max = 2000, message = "Комментарий тренера не должен быть длиннее 2000 символов")
    private String trainerComment;

    public String getDecision() {
        return decision;
    }

    public ProcessRescheduleRequestRequest setDecision(String decision) {
        this.decision = decision;
        return this;
    }

    public String getTrainerComment() {
        return trainerComment;
    }

    public ProcessRescheduleRequestRequest setTrainerComment(String trainerComment) {
        this.trainerComment = trainerComment;
        return this;
    }
}