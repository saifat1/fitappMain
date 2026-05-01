package ru.fitapp.backend.trainer.profile.dto;

public class TrainerReportSummaryResponse {

    private long totalTrainings;
    private long completedTrainings;
    private long cancelledTrainings;
    private long plannedTrainings;
    private long clientsWithTrainings;

    public long getTotalTrainings() {
        return totalTrainings;
    }

    public TrainerReportSummaryResponse setTotalTrainings(long totalTrainings) {
        this.totalTrainings = totalTrainings;
        return this;
    }

    public long getCompletedTrainings() {
        return completedTrainings;
    }

    public TrainerReportSummaryResponse setCompletedTrainings(long completedTrainings) {
        this.completedTrainings = completedTrainings;
        return this;
    }

    public long getCancelledTrainings() {
        return cancelledTrainings;
    }

    public TrainerReportSummaryResponse setCancelledTrainings(long cancelledTrainings) {
        this.cancelledTrainings = cancelledTrainings;
        return this;
    }

    public long getPlannedTrainings() {
        return plannedTrainings;
    }

    public TrainerReportSummaryResponse setPlannedTrainings(long plannedTrainings) {
        this.plannedTrainings = plannedTrainings;
        return this;
    }

    public long getClientsWithTrainings() {
        return clientsWithTrainings;
    }

    public TrainerReportSummaryResponse setClientsWithTrainings(long clientsWithTrainings) {
        this.clientsWithTrainings = clientsWithTrainings;
        return this;
    }
}