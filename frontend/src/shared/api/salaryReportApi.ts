import { apiClient } from "./axios";
import type { TrainerSalaryReportResponse } from "../../features/salary-report/model/salaryReport.types";

export const salaryReportApi = {
    async getCurrentTrainerSalaryReport(
        year: number,
        month: number
    ): Promise<TrainerSalaryReportResponse> {
        const response = await apiClient.get("/trainer/salary-report", {
            params: { year, month },
        });

        return response.data;
    },

    async exportCurrentTrainerSalaryReportPrintPdf(
        year: number,
        month: number
    ): Promise<Blob> {
        const response = await apiClient.get("/trainer/salary-report/export-print", {
            params: { year, month },
            responseType: "blob",
        });

        return response.data;
    },
};