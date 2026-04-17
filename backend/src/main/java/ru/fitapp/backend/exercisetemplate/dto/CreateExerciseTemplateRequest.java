package ru.fitapp.backend.exercisetemplate.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import ru.fitapp.backend.common.model.RepsMode;

public class CreateExerciseTemplateRequest {

    @NotBlank(message = "Название шаблона обязательно")
    @Size(max = 255, message = "Название шаблона не должно быть длиннее 255 символов")
    private String name;

    @Size(max = 2000, message = "Описание не должно быть длиннее 2000 символов")
    private String description;

    @Min(value = 1, message = "Количество подходов должно быть не меньше 1")
    private Integer sets;

    private RepsMode repsMode;

    @Min(value = 1, message = "Точное значение повторений должно быть не меньше 1")
    private Integer repsValue;

    @Min(value = 1, message = "Нижняя граница повторений должна быть не меньше 1")
    private Integer repsFrom;

    @Min(value = 1, message = "Верхняя граница повторений должна быть не меньше 1")
    private Integer repsTo;

    @Min(value = 1, message = "Длительность должна быть не меньше 1 секунды")
    private Integer durationSeconds;

    @Min(value = 0, message = "Отдых не может быть отрицательным")
    private Integer restSeconds;

    @Size(max = 2000, message = "Заметка тренера не должна быть длиннее 2000 символов")
    private String trainerNote;

    public String getName() {
        return name;
    }

    public CreateExerciseTemplateRequest setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public CreateExerciseTemplateRequest setDescription(String description) {
        this.description = description;
        return this;
    }

    public Integer getSets() {
        return sets;
    }

    public CreateExerciseTemplateRequest setSets(Integer sets) {
        this.sets = sets;
        return this;
    }

    public RepsMode getRepsMode() {
        return repsMode;
    }

    public CreateExerciseTemplateRequest setRepsMode(RepsMode repsMode) {
        this.repsMode = repsMode;
        return this;
    }

    public Integer getRepsValue() {
        return repsValue;
    }

    public CreateExerciseTemplateRequest setRepsValue(Integer repsValue) {
        this.repsValue = repsValue;
        return this;
    }

    public Integer getRepsFrom() {
        return repsFrom;
    }

    public CreateExerciseTemplateRequest setRepsFrom(Integer repsFrom) {
        this.repsFrom = repsFrom;
        return this;
    }

    public Integer getRepsTo() {
        return repsTo;
    }

    public CreateExerciseTemplateRequest setRepsTo(Integer repsTo) {
        this.repsTo = repsTo;
        return this;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public CreateExerciseTemplateRequest setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public CreateExerciseTemplateRequest setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public CreateExerciseTemplateRequest setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }
}