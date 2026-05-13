package ru.fitapp.backend.analytics.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.analytics.dto.TrackAnalyticsEventRequest;
import ru.fitapp.backend.analytics.service.AnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @PostMapping("/events")
    public ResponseEntity<Void> trackEvent(
            @Valid @RequestBody TrackAnalyticsEventRequest request,
            HttpServletRequest httpRequest
    ) {
        analyticsService.trackCurrentUserEvent(request, httpRequest);
        return ResponseEntity.noContent().build();
    }
}