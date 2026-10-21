package ru.fitapp.backend.training.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class UpdateTrainingRequest {

    private LocalDate trainingDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String status;

    @Size(max = 2000, message = "Заметка тренера не должна быть длиннее 2000 символов")
    private String trainerNote;

    /** CIRCUIT only. */
    @Min(value = 1, message = "Кругов должно быть не меньше 1")
    @Max(value = 50, message = "Кругов не может быть больше 50")
    private Integer rounds;

    /** CIRCUIT only; 0 — no rest timer. */
    @Min(value = 0, message = "Отдых не может быть отрицательным")
    @Max(value = 3600, message = "Отдых не может быть больше часа")
    private Integer roundRestSeconds;

    public Integer getRounds() {
        return rounds;
    }

    public UpdateTrainingRequest setRounds(Integer rounds) {
        this.rounds = rounds;
        return this;
    }

    public Integer getRoundRestSeconds() {
        return roundRestSeconds;
    }

    public UpdateTrainingRequest setRoundRestSeconds(Integer roundRestSeconds) {
        this.roundRestSeconds = roundRestSeconds;
        return this;
    }

    public LocalDate getTrainingDate() {
        return trainingDate;
    }

    public UpdateTrainingRequest setTrainingDate(LocalDate trainingDate) {
        this.trainingDate = trainingDate;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public UpdateTrainingRequest setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public UpdateTrainingRequest setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public UpdateTrainingRequest setStatus(String status) {
        this.status = status;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public UpdateTrainingRequest setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }
}