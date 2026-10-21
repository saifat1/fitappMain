package ru.fitapp.backend.trainingexercise.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

public class TrainingExerciseSetDto {

    @Min(value = 1, message = "Номер подхода должен быть не меньше 1")
    private Integer setNumber;

    @Min(value = 1, message = "Повторения в подходе должны быть не меньше 1")
    private Integer reps;

    @DecimalMin(value = "0.01", message = "Вес в подходе должен быть больше 0")
    @Digits(integer = 8, fraction = 2, message = "Вес должен содержать не более 8 цифр до запятой и 2 после")
    private BigDecimal weight;

    public Integer getSetNumber() {
        return setNumber;
    }

    public TrainingExerciseSetDto setSetNumber(Integer setNumber) {
        this.setNumber = setNumber;
        return this;
    }

    public Integer getReps() {
        return reps;
    }

    public TrainingExerciseSetDto setReps(Integer reps) {
        this.reps = reps;
        return this;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public TrainingExerciseSetDto setWeight(BigDecimal weight) {
        this.weight = weight;
        return this;
    }
}
