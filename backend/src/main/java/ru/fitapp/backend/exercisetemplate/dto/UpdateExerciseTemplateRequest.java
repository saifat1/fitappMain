package ru.fitapp.backend.exercisetemplate.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import ru.fitapp.backend.common.model.RepsMode;

import java.math.BigDecimal;

public class UpdateExerciseTemplateRequest {

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

    @DecimalMin(value = "0.01", message = "Вес должен быть больше 0")
    @Digits(integer = 8, fraction = 2, message = "Вес должен содержать не более 8 цифр до запятой и 2 после")
    private BigDecimal weight;

    @Min(value = 1, message = "Длительность должна быть не меньше 1 секунды")
    private Integer durationSeconds;

    @Min(value = 0, message = "Отдых не может быть отрицательным")
    private Integer restSeconds;

    @Size(max = 2000, message = "Заметка тренера не должна быть длиннее 2000 символов")
    private String trainerNote;

    public String getName() {
        return name;
    }

    public UpdateExerciseTemplateRequest setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public UpdateExerciseTemplateRequest setDescription(String description) {
        this.description = description;
        return this;
    }

    public Integer getSets() {
        return sets;
    }

    public UpdateExerciseTemplateRequest setSets(Integer sets) {
        this.sets = sets;
        return this;
    }

    public RepsMode getRepsMode() {
        return repsMode;
    }

    public UpdateExerciseTemplateRequest setRepsMode(RepsMode repsMode) {
        this.repsMode = repsMode;
        return this;
    }

    public Integer getRepsValue() {
        return repsValue;
    }

    public UpdateExerciseTemplateRequest setRepsValue(Integer repsValue) {
        this.repsValue = repsValue;
        return this;
    }

    public Integer getRepsFrom() {
        return repsFrom;
    }

    public UpdateExerciseTemplateRequest setRepsFrom(Integer repsFrom) {
        this.repsFrom = repsFrom;
        return this;
    }

    public Integer getRepsTo() {
        return repsTo;
    }

    public UpdateExerciseTemplateRequest setRepsTo(Integer repsTo) {
        this.repsTo = repsTo;
        return this;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public UpdateExerciseTemplateRequest setWeight(BigDecimal weight) {
        this.weight = weight;
        return this;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public UpdateExerciseTemplateRequest setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public UpdateExerciseTemplateRequest setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public UpdateExerciseTemplateRequest setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }
}