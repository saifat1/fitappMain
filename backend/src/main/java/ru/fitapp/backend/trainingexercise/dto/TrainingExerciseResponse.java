package ru.fitapp.backend.trainingexercise.dto;

import java.time.LocalDateTime;

public class TrainingExerciseResponse {

    private Long id;
    private Long trainingId;
    private Integer orderNum;
    private String title;
    private String description;
    private Integer sets;
    private Integer reps;
    private Integer durationSeconds;
    private Integer restSeconds;
    private Boolean isCompleted;
    private String trainerNote;
    private String clientNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public TrainingExerciseResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public TrainingExerciseResponse setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
        return this;
    }

    public Integer getOrderNum() {
        return orderNum;
    }

    public TrainingExerciseResponse setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public TrainingExerciseResponse setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public TrainingExerciseResponse setDescription(String description) {
        this.description = description;
        return this;
    }

    public Integer getSets() {
        return sets;
    }

    public TrainingExerciseResponse setSets(Integer sets) {
        this.sets = sets;
        return this;
    }

    public Integer getReps() {
        return reps;
    }

    public TrainingExerciseResponse setReps(Integer reps) {
        this.reps = reps;
        return this;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public TrainingExerciseResponse setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public TrainingExerciseResponse setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
        return this;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public TrainingExerciseResponse setIsCompleted(Boolean completed) {
        isCompleted = completed;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public TrainingExerciseResponse setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }

    public String getClientNote() {
        return clientNote;
    }

    public TrainingExerciseResponse setClientNote(String clientNote) {
        this.clientNote = clientNote;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public TrainingExerciseResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public TrainingExerciseResponse setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }
}