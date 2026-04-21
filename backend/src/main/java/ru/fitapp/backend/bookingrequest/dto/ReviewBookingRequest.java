package ru.fitapp.backend.bookingrequest.dto;

import jakarta.validation.constraints.Size;

public class ReviewBookingRequest {

    @Size(max = 2000, message = "Комментарий тренера не должен быть длиннее 2000 символов")
    private String trainerComment;

    public String getTrainerComment() {
        return trainerComment;
    }

    public ReviewBookingRequest setTrainerComment(String trainerComment) {
        this.trainerComment = trainerComment;
        return this;
    }
}
