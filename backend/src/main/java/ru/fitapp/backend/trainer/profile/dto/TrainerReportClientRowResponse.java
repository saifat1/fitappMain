package ru.fitapp.backend.trainer.profile.dto;

import java.time.LocalDate;

public class TrainerReportClientRowResponse {

    private Long clientId;
    private String clientName;
    private String clientEmail;
    private long totalTrainings;
    private long completedTrainings;
    private long cancelledTrainings;
    private long plannedTrainings;
    private LocalDate lastTrainingDate;

    public Long getClientId() {
        return clientId;
    }

    public TrainerReportClientRowResponse setClientId(Long clientId) {
        this.clientId = clientId;
        return this;
    }

    public String getClientName() {
        return clientName;
    }

    public TrainerReportClientRowResponse setClientName(String clientName) {
        this.clientName = clientName;
        return this;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public TrainerReportClientRowResponse setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
        return this;
    }

    public long getTotalTrainings() {
        return totalTrainings;
    }

    public TrainerReportClientRowResponse setTotalTrainings(long totalTrainings) {
        this.totalTrainings = totalTrainings;
        return this;
    }

    public long getCompletedTrainings() {
        return completedTrainings;
    }

    public TrainerReportClientRowResponse setCompletedTrainings(long completedTrainings) {
        this.completedTrainings = completedTrainings;
        return this;
    }

    public long getCancelledTrainings() {
        return cancelledTrainings;
    }

    public TrainerReportClientRowResponse setCancelledTrainings(long cancelledTrainings) {
        this.cancelledTrainings = cancelledTrainings;
        return this;
    }

    public long getPlannedTrainings() {
        return plannedTrainings;
    }

    public TrainerReportClientRowResponse setPlannedTrainings(long plannedTrainings) {
        this.plannedTrainings = plannedTrainings;
        return this;
    }

    public LocalDate getLastTrainingDate() {
        return lastTrainingDate;
    }

    public TrainerReportClientRowResponse setLastTrainingDate(LocalDate lastTrainingDate) {
        this.lastTrainingDate = lastTrainingDate;
        return this;
    }
}