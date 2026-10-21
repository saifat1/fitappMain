package ru.fitapp.backend.trainingexercise.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ru.fitapp.backend.trainingexercise.entity.TrainingExerciseField;

/** Circuit station field: TEXT uses {@code text}, TIMER uses {@code seconds} (may be empty — timer is optional). */
public class TrainingExerciseFieldDto {

    @NotNull(message = "Не указан тип поля")
    private TrainingExerciseField.Type type;

    @Size(max = 2000, message = "Текст поля не должен быть длиннее 2000 символов")
    private String text;

    @Min(value = 1, message = "Время секундомера должно быть больше 0")
    @Max(value = 86400, message = "Время секундомера слишком большое")
    private Integer seconds;

    public TrainingExerciseField.Type getType() {
        return type;
    }

    public TrainingExerciseFieldDto setType(TrainingExerciseField.Type type) {
        this.type = type;
        return this;
    }

    public String getText() {
        return text;
    }

    public TrainingExerciseFieldDto setText(String text) {
        this.text = text;
        return this;
    }

    public Integer getSeconds() {
        return seconds;
    }

    public TrainingExerciseFieldDto setSeconds(Integer seconds) {
        this.seconds = seconds;
        return this;
    }
}
