package ru.fitapp.backend.trainer.client.dto;

import ru.fitapp.backend.common.model.RepsMode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ClientHistoryExerciseResponse {

    private Long id;
    private Integer orderNum;
    private String title;
    private String description;
    private Integer sets;
    private RepsMode repsMode;
    private Integer repsValue;
    private Integer repsFrom;
    private Integer repsTo;
    private String repsDisplay;
    private BigDecimal weight;
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

    public ClientHistoryExerciseResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public Integer getOrderNum() {
        return orderNum;
    }

    public ClientHistoryExerciseResponse setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public ClientHistoryExerciseResponse setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public ClientHistoryExerciseResponse setDescription(String description) {
        this.description = description;
        return this;
    }

    public Integer getSets() {
        return sets;
    }

    public ClientHistoryExerciseResponse setSets(Integer sets) {
        this.sets = sets;
        return this;
    }

    public RepsMode getRepsMode() {
        return repsMode;
    }

    public ClientHistoryExerciseResponse setRepsMode(RepsMode repsMode) {
        this.repsMode = repsMode;
        return this;
    }

    public Integer getRepsValue() {
        return repsValue;
    }

    public ClientHistoryExerciseResponse setRepsValue(Integer repsValue) {
        this.repsValue = repsValue;
        return this;
    }

    public Integer getRepsFrom() {
        return repsFrom;
    }

    public ClientHistoryExerciseResponse setRepsFrom(Integer repsFrom) {
        this.repsFrom = repsFrom;
        return this;
    }

    public Integer getRepsTo() {
        return repsTo;
    }

    public ClientHistoryExerciseResponse setRepsTo(Integer repsTo) {
        this.repsTo = repsTo;
        return this;
    }

    public String getRepsDisplay() {
        return repsDisplay;
    }

    public ClientHistoryExerciseResponse setRepsDisplay(String repsDisplay) {
        this.repsDisplay = repsDisplay;
        return this;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public ClientHistoryExerciseResponse setWeight(BigDecimal weight) {
        this.weight = weight;
        return this;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public ClientHistoryExerciseResponse setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public ClientHistoryExerciseResponse setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
        return this;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public ClientHistoryExerciseResponse setIsCompleted(Boolean completed) {
        isCompleted = completed;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public ClientHistoryExerciseResponse setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }

    public String getClientNote() {
        return clientNote;
    }

    public ClientHistoryExerciseResponse setClientNote(String clientNote) {
        this.clientNote = clientNote;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public ClientHistoryExerciseResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public ClientHistoryExerciseResponse setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }
}