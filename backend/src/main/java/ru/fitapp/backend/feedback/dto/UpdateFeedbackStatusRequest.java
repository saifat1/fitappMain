package ru.fitapp.backend.feedback.dto;

import jakarta.validation.constraints.NotNull;
import ru.fitapp.backend.feedback.model.FeedbackStatus;

public class UpdateFeedbackStatusRequest {

    @NotNull(message = "Выберите статус")
    private FeedbackStatus status;

    public FeedbackStatus getStatus() {
        return status;
    }

    public UpdateFeedbackStatusRequest setStatus(FeedbackStatus status) {
        this.status = status;
        return this;
    }
}
