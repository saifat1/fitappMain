package ru.fitapp.backend.training.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    /** PERSONAL (default), INDEPENDENT or CIRCUIT. */
    private String trainingType;

    /** Only meaningful for INDEPENDENT trainings. */
    private List<String> focusMuscleGroups;

    /** Required for CIRCUIT trainings. */
    @Size(max = 255, message = "Название тренировки не должно быть длиннее 255 символов")
    private String title;

    @Size(max = 2000, message = "Описание тренировки не должно быть длиннее 2000 символов")
    private String description;

    /** CIRCUIT only; empty means 1 round. */
    @Min(value = 1, message = "Кругов должно быть не меньше 1")
    @Max(value = 50, message = "Кругов не может быть больше 50")
    private Integer rounds;

    /** CIRCUIT only: rest timer after each round, seconds; empty — no rest timer. */
    @Min(value = 0, message = "Отдых не может быть отрицательным")
    @Max(value = 3600, message = "Отдых не может быть больше часа")
    private Integer roundRestSeconds;

    public Integer getRounds() {
        return rounds;
    }

    public CreateTrainingRequest setRounds(Integer rounds) {
        this.rounds = rounds;
        return this;
    }

    public Integer getRoundRestSeconds() {
        return roundRestSeconds;
    }

    public CreateTrainingRequest setRoundRestSeconds(Integer roundRestSeconds) {
        this.roundRestSeconds = roundRestSeconds;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public CreateTrainingRequest setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public CreateTrainingRequest setDescription(String description) {
        this.description = description;
        return this;
    }

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