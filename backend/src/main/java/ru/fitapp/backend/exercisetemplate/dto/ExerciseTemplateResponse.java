package ru.fitapp.backend.exercisetemplate.dto;

import ru.fitapp.backend.common.model.MuscleGroup;
import ru.fitapp.backend.common.model.RepsMode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ExerciseTemplateResponse {

    private Long id;
    private Long trainerId;
    private String name;
    private String description;
    private MuscleGroup muscleGroup;
    private Integer sets;
    private RepsMode repsMode;
    private Integer repsValue;
    private Integer repsFrom;
    private Integer repsTo;
    private String repsDisplay;
    private BigDecimal weight;
    private Integer durationSeconds;
    private Integer restSeconds;
    private String trainerNote;
    private Boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public ExerciseTemplateResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public Long getTrainerId() {
        return trainerId;
    }

    public ExerciseTemplateResponse setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
        return this;
    }

    public String getName() {
        return name;
    }

    public ExerciseTemplateResponse setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public ExerciseTemplateResponse setDescription(String description) {
        this.description = description;
        return this;
    }

    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public ExerciseTemplateResponse setMuscleGroup(MuscleGroup muscleGroup) {
        this.muscleGroup = muscleGroup;
        return this;
    }

    public Integer getSets() {
        return sets;
    }

    public ExerciseTemplateResponse setSets(Integer sets) {
        this.sets = sets;
        return this;
    }

    public RepsMode getRepsMode() {
        return repsMode;
    }

    public ExerciseTemplateResponse setRepsMode(RepsMode repsMode) {
        this.repsMode = repsMode;
        return this;
    }

    public Integer getRepsValue() {
        return repsValue;
    }

    public ExerciseTemplateResponse setRepsValue(Integer repsValue) {
        this.repsValue = repsValue;
        return this;
    }

    public Integer getRepsFrom() {
        return repsFrom;
    }

    public ExerciseTemplateResponse setRepsFrom(Integer repsFrom) {
        this.repsFrom = repsFrom;
        return this;
    }

    public Integer getRepsTo() {
        return repsTo;
    }

    public ExerciseTemplateResponse setRepsTo(Integer repsTo) {
        this.repsTo = repsTo;
        return this;
    }

    public String getRepsDisplay() {
        return repsDisplay;
    }

    public ExerciseTemplateResponse setRepsDisplay(String repsDisplay) {
        this.repsDisplay = repsDisplay;
        return this;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public ExerciseTemplateResponse setWeight(BigDecimal weight) {
        this.weight = weight;
        return this;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public ExerciseTemplateResponse setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public ExerciseTemplateResponse setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public ExerciseTemplateResponse setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }

    public Boolean getIsArchived() {
        return isArchived;
    }

    public ExerciseTemplateResponse setIsArchived(Boolean archived) {
        isArchived = archived;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public ExerciseTemplateResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public ExerciseTemplateResponse setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }
}