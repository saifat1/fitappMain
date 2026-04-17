package ru.fitapp.backend.trainingexercise.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import ru.fitapp.backend.common.model.RepsMode;

public class UpdateTrainingExerciseRequest {

    @Size(max = 255, message = "Название упражнения не должно быть длиннее 255 символов")
    private String title;

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

    private Boolean isCompleted;

    @Size(max = 2000, message = "Заметка тренера не должна быть длиннее 2000 символов")
    private String trainerNote;

    @Size(max = 2000, message = "Заметка клиента не должна быть длиннее 2000 символов")
    private String clientNote;

    @Min(value = 1, message = "Порядковый номер должен быть не меньше 1")
    private Integer orderNum;

    public String getTitle() {
        return title;
    }

    public UpdateTrainingExerciseRequest setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public UpdateTrainingExerciseRequest setDescription(String description) {
        this.description = description;
        return this;
    }

    public Integer getSets() {
        return sets;
    }

    public UpdateTrainingExerciseRequest setSets(Integer sets) {
        this.sets = sets;
        return this;
    }

    public RepsMode getRepsMode() {
        return repsMode;
    }

    public UpdateTrainingExerciseRequest setRepsMode(RepsMode repsMode) {
        this.repsMode = repsMode;
        return this;
    }

    public Integer getRepsValue() {
        return repsValue;
    }

    public UpdateTrainingExerciseRequest setRepsValue(Integer repsValue) {
        this.repsValue = repsValue;
        return this;
    }

    public Integer getRepsFrom() {
        return repsFrom;
    }

    public UpdateTrainingExerciseRequest setRepsFrom(Integer repsFrom) {
        this.repsFrom = repsFrom;
        return this;
    }

    public Integer getRepsTo() {
        return repsTo;
    }

    public UpdateTrainingExerciseRequest setRepsTo(Integer repsTo) {
        this.repsTo = repsTo;
        return this;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public UpdateTrainingExerciseRequest setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public UpdateTrainingExerciseRequest setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
        return this;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public UpdateTrainingExerciseRequest setIsCompleted(Boolean completed) {
        isCompleted = completed;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public UpdateTrainingExerciseRequest setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }

    public String getClientNote() {
        return clientNote;
    }

    public UpdateTrainingExerciseRequest setClientNote(String clientNote) {
        this.clientNote = clientNote;
        return this;
    }

    public Integer getOrderNum() {
        return orderNum;
    }

    public UpdateTrainingExerciseRequest setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
        return this;
    }
}