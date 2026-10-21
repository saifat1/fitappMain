export type TrainerSalaryReportSummaryResponse = {
    personalTrainingCount: number;
    extraTrainingCount: number;
    dutyHoursCount: number;
};

export type TrainerSalaryReportTrainingRowResponse = {
    trainingId: number;
    date: string;
    startTime: string;
    endTime: string | null;
    clientId: number;
    clientName: string;
    trainingTypeLabel: string;
    contractNumber: string | null;
    contractEndDate: string | null;
    /** Contract size (null when the training is not drawn from a contract). */
    contractTotalTrainings: number | null;
    /** Contract balance right after this training. */
    contractRemainingTrainings: number | null;
};

export type TrainerSalaryReportDutyRowResponse = {
    dutySlotId: number;
    date: string;
    startTime: string;
    endTime: string;
    typeLabel: string;
};

export type TrainerSalaryReportResponse = {
    trainerId: number;
    trainerName: string;
    year: number;
    month: number;
    summary: TrainerSalaryReportSummaryResponse;
    trainingRows: TrainerSalaryReportTrainingRowResponse[];
    dutyRows: TrainerSalaryReportDutyRowResponse[];
};