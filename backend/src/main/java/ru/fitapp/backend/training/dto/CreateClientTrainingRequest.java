package ru.fitapp.backend.training.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/** FIT-77: the client writes down a self-guided training for themselves. */
public class CreateClientTrainingRequest {

    /** Which of the client's trainers sees it; empty — the first one (as on the client's home screen). */
    private Long trainerId;

    @NotNull(message = "Дата обязательна")
    private LocalDate trainingDate;

    @NotNull(message = "Укажите время начала")
    private LocalTime startTime;

    @NotNull(message = "Укажите время окончания")
    private LocalTime endTime;

    private String title;

    private String description;

    private List<String> focusMuscleGroups;

    public Long getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
    }

    public LocalDate getTrainingDate() {
        return trainingDate;
    }

    public void setTrainingDate(LocalDate trainingDate) {
        this.trainingDate = trainingDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getFocusMuscleGroups() {
        return focusMuscleGroups;
    }

    public void setFocusMuscleGroups(List<String> focusMuscleGroups) {
        this.focusMuscleGroups = focusMuscleGroups;
    }
}
