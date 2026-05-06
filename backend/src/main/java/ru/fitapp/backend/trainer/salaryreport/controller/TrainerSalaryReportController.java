package ru.fitapp.backend.trainer.salaryreport.controller;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.trainer.salaryreport.dto.TrainerSalaryReportResponse;
import ru.fitapp.backend.trainer.salaryreport.service.TrainerSalaryReportPrintPdfService;
import ru.fitapp.backend.trainer.salaryreport.service.TrainerSalaryReportService;

@RestController
@RequestMapping("/api/trainer/salary-report")
public class TrainerSalaryReportController {

    private final TrainerSalaryReportService trainerSalaryReportService;
    private final TrainerSalaryReportPrintPdfService trainerSalaryReportPrintPdfService;

    public TrainerSalaryReportController(
            TrainerSalaryReportService trainerSalaryReportService,
            TrainerSalaryReportPrintPdfService trainerSalaryReportPrintPdfService
    ) {
        this.trainerSalaryReportService = trainerSalaryReportService;
        this.trainerSalaryReportPrintPdfService = trainerSalaryReportPrintPdfService;
    }

    @GetMapping
    public TrainerSalaryReportResponse getCurrentTrainerSalaryReport(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return trainerSalaryReportService.getCurrentTrainerReport(year, month);
    }

    @GetMapping(value = "/export-print", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportCurrentTrainerSalaryReportPrintPdf(
            @RequestParam int year,
            @RequestParam int month
    ) {
        byte[] pdf = trainerSalaryReportPrintPdfService.exportCurrentTrainerPrintPdf(year, month);

        String filename = String.format("salary-report-print-%d-%02d.pdf", year, month);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString()
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}