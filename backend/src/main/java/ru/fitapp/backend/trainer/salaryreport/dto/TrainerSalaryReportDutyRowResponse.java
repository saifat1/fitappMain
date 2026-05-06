package ru.fitapp.backend.trainer.salaryreport.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class TrainerSalaryReportDutyRowResponse {

    private Long dutySlotId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String typeLabel;

    public Long getDutySlotId() {
        return dutySlotId;
    }

    public TrainerSalaryReportDutyRowResponse setDutySlotId(Long dutySlotId) {
        this.dutySlotId = dutySlotId;
        return this;
    }

    public LocalDate getDate() {
        return date;
    }

    public TrainerSalaryReportDutyRowResponse setDate(LocalDate date) {
        this.date = date;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerSalaryReportDutyRowResponse setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerSalaryReportDutyRowResponse setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public String getTypeLabel() {
        return typeLabel;
    }

    public TrainerSalaryReportDutyRowResponse setTypeLabel(String typeLabel) {
        this.typeLabel = typeLabel;
        return this;
    }
}