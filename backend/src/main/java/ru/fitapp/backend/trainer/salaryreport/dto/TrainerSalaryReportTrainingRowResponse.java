package ru.fitapp.backend.trainer.salaryreport.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class TrainerSalaryReportTrainingRowResponse {

    private Long trainingId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long clientId;
    private String clientName;
    private String trainingTypeLabel;
    private String contractNumber;
    private LocalDate contractEndDate;
    private Integer contractTotalTrainings;
    private Integer contractRemainingTrainings;

    public Long getTrainingId() {
        return trainingId;
    }

    public TrainerSalaryReportTrainingRowResponse setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
        return this;
    }

    public LocalDate getDate() {
        return date;
    }

    public TrainerSalaryReportTrainingRowResponse setDate(LocalDate date) {
        this.date = date;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerSalaryReportTrainingRowResponse setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerSalaryReportTrainingRowResponse setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public Long getClientId() {
        return clientId;
    }

    public TrainerSalaryReportTrainingRowResponse setClientId(Long clientId) {
        this.clientId = clientId;
        return this;
    }

    public String getClientName() {
        return clientName;
    }

    public TrainerSalaryReportTrainingRowResponse setClientName(String clientName) {
        this.clientName = clientName;
        return this;
    }

    public String getTrainingTypeLabel() {
        return trainingTypeLabel;
    }

    public TrainerSalaryReportTrainingRowResponse setTrainingTypeLabel(String trainingTypeLabel) {
        this.trainingTypeLabel = trainingTypeLabel;
        return this;
    }

    public String getContractNumber() {
        return contractNumber;
    }

    public TrainerSalaryReportTrainingRowResponse setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
        return this;
    }

    public LocalDate getContractEndDate() {
        return contractEndDate;
    }

    public TrainerSalaryReportTrainingRowResponse setContractEndDate(LocalDate contractEndDate) {
        this.contractEndDate = contractEndDate;
        return this;
    }

    public Integer getContractTotalTrainings() {
        return contractTotalTrainings;
    }

    public TrainerSalaryReportTrainingRowResponse setContractTotalTrainings(Integer contractTotalTrainings) {
        this.contractTotalTrainings = contractTotalTrainings;
        return this;
    }

    public Integer getContractRemainingTrainings() {
        return contractRemainingTrainings;
    }

    public TrainerSalaryReportTrainingRowResponse setContractRemainingTrainings(Integer contractRemainingTrainings) {
        this.contractRemainingTrainings = contractRemainingTrainings;
        return this;
    }
}