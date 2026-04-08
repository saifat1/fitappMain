package ru.fitapp.backend.trainingexercise.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateTrainingExerciseRequest {

    @NotBlank(message = "Название упражнения обязательно")
    @Size(max = 255, message = "Название упражнения не должно быть длиннее 255 символов")
    private String title;

    @Size(max = 2000, message = "Описание не должно быть длиннее 2000 символов")
    private String description;

    @Min(value = 1, message = "Количество подходов должно быть не меньше 1")
    private Integer sets;

    @Min(value = 1, message = "Количество повторений должно быть не меньше 1")
    private Integer reps;

    @Min(value = 1, message = "Длительность должна быть не меньше 1 секунды")
    private Integer durationSeconds;

    @Min(value = 0, message = "Отдых не может быть отрицательным")
    private Integer restSeconds;

    @Size(max = 2000, message = "Заметка тренера не должна быть длиннее 2000 символов")
    private String trainerNote;

    public String getTitle() {
        return title;
    }

    public CreateTrainingExerciseRequest setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public CreateTrainingExerciseRequest setDescription(String description) {
        this.description = description;
        return this;
    }

    public Integer getSets() {
        return sets;
    }

    public CreateTrainingExerciseRequest setSets(Integer sets) {
        this.sets = sets;
        return this;
    }

    public Integer getReps() {
        return reps;
    }

    public CreateTrainingExerciseRequest setReps(Integer reps) {
        this.reps = reps;
        return this;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public CreateTrainingExerciseRequest setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public CreateTrainingExerciseRequest setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public CreateTrainingExerciseRequest setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }
}