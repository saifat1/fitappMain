package ru.fitapp.backend.analytics.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ru.fitapp.backend.analytics.dto.AnalyticsSummaryResponse;
import ru.fitapp.backend.analytics.service.AnalyticsStatsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsStatsController {

    private final AnalyticsStatsService analyticsStatsService;

    public AnalyticsStatsController(AnalyticsStatsService analyticsStatsService) {
        this.analyticsStatsService = analyticsStatsService;
    }

    @GetMapping("/summary")
    public AnalyticsSummaryResponse getSummary() {
        return analyticsStatsService.getSummary();
    }
}