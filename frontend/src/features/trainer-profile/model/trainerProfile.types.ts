export type TrainerProfileResponse = {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
};

export type UpdateTrainerProfileRequest = {
    firstName?: string;
    lastName?: string;
    phone?: string;
};

export type ChangeTrainerPasswordRequest = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export type TrainerReportStatus = "ALL" | "PLANNED" | "COMPLETED" | "CANCELLED";

export type TrainerReportFilters = {
    from: string;
    to: string;
    clientId: string;
    status: TrainerReportStatus;
};

export type TrainerReportSummaryResponse = {
    totalTrainings: number;
    completedTrainings: number;
    cancelledTrainings: number;
    plannedTrainings: number;
    clientsWithTrainings: number;
};

export type TrainerReportClientRowResponse = {
    clientId: number;
    clientName: string;
    clientEmail: string;
    totalTrainings: number;
    completedTrainings: number;
    cancelledTrainings: number;
    plannedTrainings: number;
    lastTrainingDate: string | null;
};

export type TrainerReportsResponse = {
    summary: TrainerReportSummaryResponse;
    rows: TrainerReportClientRowResponse[];
};