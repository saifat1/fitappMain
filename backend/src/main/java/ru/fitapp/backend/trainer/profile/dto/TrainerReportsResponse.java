package ru.fitapp.backend.trainer.profile.dto;

import java.util.ArrayList;
import java.util.List;

public class TrainerReportsResponse {

    private TrainerReportSummaryResponse summary;
    private List<TrainerReportClientRowResponse> rows = new ArrayList<>();

    public TrainerReportSummaryResponse getSummary() {
        return summary;
    }

    public TrainerReportsResponse setSummary(TrainerReportSummaryResponse summary) {
        this.summary = summary;
        return this;
    }

    public List<TrainerReportClientRowResponse> getRows() {
        return rows;
    }

    public TrainerReportsResponse setRows(List<TrainerReportClientRowResponse> rows) {
        this.rows = rows;
        return this;
    }
}