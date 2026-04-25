package ru.fitapp.backend.trainer.client.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class ClientHistoryTrainingResponse {

    private Long id;
    private LocalDate trainingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String trainerNote;
    private String clientNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ClientHistoryExerciseResponse> exercises = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public ClientHistoryTrainingResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public LocalDate getTrainingDate() {
        return trainingDate;
    }

    public ClientHistoryTrainingResponse setTrainingDate(LocalDate trainingDate) {
        this.trainingDate = trainingDate;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public ClientHistoryTrainingResponse setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public ClientHistoryTrainingResponse setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public String getStatus() {
        return status;
    }

    public ClientHistoryTrainingResponse setStatus(String status) {
        this.status = status;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public ClientHistoryTrainingResponse setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }

    public String getClientNote() {
        return clientNote;
    }

    public ClientHistoryTrainingResponse setClientNote(String clientNote) {
        this.clientNote = clientNote;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public ClientHistoryTrainingResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public ClientHistoryTrainingResponse setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    public List<ClientHistoryExerciseResponse> getExercises() {
        return exercises;
    }

    public ClientHistoryTrainingResponse setExercises(List<ClientHistoryExerciseResponse> exercises) {
        this.exercises = exercises;
        return this;
    }
}