package ru.fitapp.backend.training.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class CreateTrainingRequest {

    @NotNull(message = "clientId обязателен")
    private Long clientId;

    @NotNull(message = "Дата тренировки обязательна")
    private LocalDate trainingDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @Size(max = 2000, message = "Заметка тренера не должна быть длиннее 2000 символов")
    private String trainerNote;

    /** PERSONAL (default) or INDEPENDENT. */
    private String trainingType;

    /** Only meaningful for INDEPENDENT trainings. */
    private List<String> focusMuscleGroups;

    public Long getClientId() {
        return clientId;
    }

    public CreateTrainingRequest setClientId(Long clientId) {
        this.clientId = clientId;
        return this;
    }

    public LocalDate getTrainingDate() {
        return trainingDate;
    }

    public CreateTrainingRequest setTrainingDate(LocalDate trainingDate) {
        this.trainingDate = trainingDate;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public CreateTrainingRequest setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public CreateTrainingRequest setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public CreateTrainingRequest setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }

    public String getTrainingType() {
        return trainingType;
    }

    public CreateTrainingRequest setTrainingType(String trainingType) {
        this.trainingType = trainingType;
        return this;
    }

    public List<String> getFocusMuscleGroups() {
        return focusMuscleGroups;
    }

    public CreateTrainingRequest setFocusMuscleGroups(List<String> focusMuscleGroups) {
        this.focusMuscleGroups = focusMuscleGroups;
        return this;
    }
}