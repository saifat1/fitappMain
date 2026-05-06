package ru.fitapp.backend.trainer.salaryreport.dto;

import java.util.ArrayList;
import java.util.List;

public class TrainerSalaryReportResponse {

    private Long trainerId;
    private String trainerName;
    private int year;
    private int month;
    private TrainerSalaryReportSummaryResponse summary;
    private List<TrainerSalaryReportTrainingRowResponse> trainingRows = new ArrayList<>();
    private List<TrainerSalaryReportDutyRowResponse> dutyRows = new ArrayList<>();

    public Long getTrainerId() {
        return trainerId;
    }

    public TrainerSalaryReportResponse setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
        return this;
    }

    public String getTrainerName() {
        return trainerName;
    }

    public TrainerSalaryReportResponse setTrainerName(String trainerName) {
        this.trainerName = trainerName;
        return this;
    }

    public int getYear() {
        return year;
    }

    public TrainerSalaryReportResponse setYear(int year) {
        this.year = year;
        return this;
    }

    public int getMonth() {
        return month;
    }

    public TrainerSalaryReportResponse setMonth(int month) {
        this.month = month;
        return this;
    }

    public TrainerSalaryReportSummaryResponse getSummary() {
        return summary;
    }

    public TrainerSalaryReportResponse setSummary(TrainerSalaryReportSummaryResponse summary) {
        this.summary = summary;
        return this;
    }

    public List<TrainerSalaryReportTrainingRowResponse> getTrainingRows() {
        return trainingRows;
    }

    public TrainerSalaryReportResponse setTrainingRows(List<TrainerSalaryReportTrainingRowResponse> trainingRows) {
        this.trainingRows = trainingRows;
        return this;
    }

    public List<TrainerSalaryReportDutyRowResponse> getDutyRows() {
        return dutyRows;
    }

    public TrainerSalaryReportResponse setDutyRows(List<TrainerSalaryReportDutyRowResponse> dutyRows) {
        this.dutyRows = dutyRows;
        return this;
    }
}