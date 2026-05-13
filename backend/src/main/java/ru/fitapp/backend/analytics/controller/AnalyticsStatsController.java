package ru.fitapp.backend.analytics.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ru.fitapp.backend.analytics.dto.AnalyticsSummaryResponse;
import ru.fitapp.backend.analytics.service.AnalyticsStatsService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsStatsController {

    private final AnalyticsStatsService analyticsStatsService;

    public AnalyticsStatsController(AnalyticsStatsService analyticsStatsService) {
        this.analyticsStatsService = analyticsStatsService;
    }

    @GetMapping("/summary")
    public AnalyticsSummaryResponse getSummary(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return analyticsStatsService.getSummary(from, to);
    }
}