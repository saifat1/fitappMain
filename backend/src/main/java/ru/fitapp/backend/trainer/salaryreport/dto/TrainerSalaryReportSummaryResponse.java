package ru.fitapp.backend.trainer.salaryreport.dto;

public class TrainerSalaryReportSummaryResponse {

    private long personalTrainingCount;
    private long extraTrainingCount;
    private long dutyHoursCount;

    public long getPersonalTrainingCount() {
        return personalTrainingCount;
    }

    public TrainerSalaryReportSummaryResponse setPersonalTrainingCount(long personalTrainingCount) {
        this.personalTrainingCount = personalTrainingCount;
        return this;
    }

    public long getExtraTrainingCount() {
        return extraTrainingCount;
    }

    public TrainerSalaryReportSummaryResponse setExtraTrainingCount(long extraTrainingCount) {
        this.extraTrainingCount = extraTrainingCount;
        return this;
    }

    public long getDutyHoursCount() {
        return dutyHoursCount;
    }

    public TrainerSalaryReportSummaryResponse setDutyHoursCount(long dutyHoursCount) {
        this.dutyHoursCount = dutyHoursCount;
        return this;
    }
}