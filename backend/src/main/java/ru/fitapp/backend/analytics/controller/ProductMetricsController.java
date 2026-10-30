package ru.fitapp.backend.analytics.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.analytics.service.ProductMetricsService;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.mail.MailService;
import ru.fitapp.backend.common.security.CurrentUserService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * FIT-72. /metrics — for the admin «Аналитика» screen (admin JWT).
 * /report/** — for the weekly report: the caller presents ANALYTICS_REPORT_TOKEN (server .env only) in X-Report-Token,
 * reads the metrics and emails the written report to ANALYTICS_REPORT_EMAIL (+ ANALYTICS_REPORT_CC with copyToTeam).
 * Empty token = report endpoints off.
 */
@RestController
@RequestMapping("/api/analytics")
public class ProductMetricsController {

    private final ProductMetricsService metricsService;
    private final CurrentUserService currentUserService;
    private final MailService mailService;

    @Value("${app.analytics.report-token:}")
    private String reportToken;

    @Value("${app.analytics.report-email:}")
    private String reportEmail;

    @Value("${app.analytics.report-cc:}")
    private String reportCc;

    public ProductMetricsController(
            ProductMetricsService metricsService,
            CurrentUserService currentUserService,
            MailService mailService
    ) {
        this.metricsService = metricsService;
        this.currentUserService = currentUserService;
        this.mailService = mailService;
    }

    @GetMapping("/metrics")
    public Map<String, Object> metrics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        currentUserService.getCurrentAdmin();
        return compute(from, to);
    }

    @GetMapping("/report/metrics")
    public Map<String, Object> reportMetrics(
            @RequestHeader(value = "X-Report-Token", required = false) String token,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        assertReportToken(token);
        return compute(from, to);
    }

    @PostMapping("/report/email")
    public Map<String, String> sendReport(
            @RequestHeader(value = "X-Report-Token", required = false) String token,
            @Valid @RequestBody ReportEmailRequest request
    ) {
        assertReportToken(token);
        if (reportEmail == null || reportEmail.isBlank()) {
            throw new ApiException("REPORT_EMAIL_NOT_SET", "Не задан адрес для отчёта (ANALYTICS_REPORT_EMAIL)");
        }
        List<String> recipients = new ArrayList<>(List.of(reportEmail.trim()));
        if (Boolean.TRUE.equals(request.copyToTeam()) && reportCc != null) {
            Arrays.stream(reportCc.split(","))
                    .map(String::trim)
                    .filter(email -> !email.isEmpty() && !recipients.contains(email))
                    .forEach(recipients::add);
        }
        recipients.forEach(email -> mailService.sendNotification(email, request.subject(), request.text()));
        return Map.of("sentTo", String.join(", ", recipients));
    }

    /** copyToTeam — also send to ANALYTICS_REPORT_CC (the weekly metrics report, not server alerts). */
    public record ReportEmailRequest(
            @NotBlank @Size(max = 200) String subject,
            @NotBlank @Size(max = 50_000) String text,
            Boolean copyToTeam
    ) {
    }

    /** Default period: the last full week, Monday to Sunday. */
    private Map<String, Object> compute(LocalDate from, LocalDate to) {
        LocalDate end = to != null ? to : LocalDate.now().minusDays(LocalDate.now().getDayOfWeek().getValue());
        LocalDate start = from != null ? from : end.minusDays(6);
        if (start.isAfter(end)) {
            throw new ApiException("INVALID_PERIOD", "Начало периода позже конца");
        }
        return metricsService.compute(start, end);
    }

    private void assertReportToken(String token) {
        boolean ok = reportToken != null && !reportToken.isBlank() && token != null
                && MessageDigest.isEqual(reportToken.trim().getBytes(StandardCharsets.UTF_8), token.trim().getBytes(StandardCharsets.UTF_8));
        if (!ok) {
            throw new ApiException("ACCESS_DENIED", "Нет доступа к отчёту");
        }
    }
}
