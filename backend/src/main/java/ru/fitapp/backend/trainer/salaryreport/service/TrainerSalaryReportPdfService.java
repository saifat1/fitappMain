package ru.fitapp.backend.trainer.salaryreport.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.trainer.salaryreport.dto.TrainerSalaryReportDutyRowResponse;
import ru.fitapp.backend.trainer.salaryreport.dto.TrainerSalaryReportResponse;
import ru.fitapp.backend.trainer.salaryreport.dto.TrainerSalaryReportTrainingRowResponse;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class TrainerSalaryReportPdfService {

    private static final float PAGE_MARGIN = 36f;
    private static final float FONT_SIZE = 10f;
    private static final float SMALL_FONT_SIZE = 9f;
    private static final float TITLE_FONT_SIZE = 18f;
    private static final float SECTION_FONT_SIZE = 13f;
    private static final float LINE_HEIGHT = 14f;
    private static final float CELL_PADDING = 4f;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final PDRectangle LANDSCAPE_A4 =
            new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth());

    private final TrainerSalaryReportService trainerSalaryReportService;

    public TrainerSalaryReportPdfService(TrainerSalaryReportService trainerSalaryReportService) {
        this.trainerSalaryReportService = trainerSalaryReportService;
    }

    public byte[] exportCurrentTrainerReportPdf(int year, int month) {
        TrainerSalaryReportResponse report =
                trainerSalaryReportService.getCurrentTrainerReport(year, month);

        try (PDDocument document = new PDDocument()) {
            PDType0Font regular = loadFont(document, "fonts/DejaVuSans.ttf");
            PDType0Font bold = loadFont(document, "fonts/DejaVuSans-Bold.ttf");

            PdfWriter writer = new PdfWriter(document, regular, bold);

            try {
                writer.writeTitle("Зарплатный отчёт тренера");
                writer.writeMutedLine("Тренер: " + safe(report.getTrainerName()));
                writer.writeMutedLine(
                        "Период: " + String.format("%02d.%d", report.getMonth(), report.getYear())
                );
                writer.writeSpacer(6f);

                writer.writeSection("Итоги");
                writer.writeNormalLine("Кол-во ПТ: " + report.getSummary().getPersonalTrainingCount());
                writer.writeNormalLine("Кол-во ЭТ: " + report.getSummary().getExtraTrainingCount());
                writer.writeNormalLine("Кол-во дежурных часов: " + report.getSummary().getDutyHoursCount());
                writer.writeSpacer(8f);

                writer.writeSection("Завершённые тренировки");

                if (report.getTrainingRows().isEmpty()) {
                    writer.writeMutedLine("За выбранный месяц завершённых тренировок нет.");
                } else {
                    List<String[]> trainingRows = new ArrayList<>();
                    for (TrainerSalaryReportTrainingRowResponse row : report.getTrainingRows()) {
                        trainingRows.add(new String[]{
                                formatDate(row.getDate()),
                                formatTime(row.getStartTime()) + " - " + formatTime(row.getEndTime()),
                                safe(row.getClientName()),
                                safe(row.getTrainingTypeLabel()),
                                safe(row.getContractNumber()),
                                formatDate(row.getContractEndDate())
                        });
                    }

                    writer.drawTable(
                            new String[]{
                                    "Дата",
                                    "Время",
                                    "Клиент",
                                    "Вид",
                                    "Договор",
                                    "Окончание договора"
                            },
                            trainingRows,
                            new float[]{60f, 70f, 180f, 45f, 120f, 100f}
                    );
                }

                writer.writeSpacer(10f);
                writer.writeSection("Дежурные часы");

                if (report.getDutyRows().isEmpty()) {
                    writer.writeMutedLine("За выбранный месяц дежурных часов нет.");
                } else {
                    List<String[]> dutyRows = new ArrayList<>();
                    for (TrainerSalaryReportDutyRowResponse row : report.getDutyRows()) {
                        dutyRows.add(new String[]{
                                formatDate(row.getDate()),
                                formatTime(row.getStartTime()) + " - " + formatTime(row.getEndTime()),
                                safe(row.getTypeLabel())
                        });
                    }

                    writer.drawTable(
                            new String[]{"Дата", "Время", "Тип"},
                            dutyRows,
                            new float[]{90f, 90f, 180f}
                    );
                }

                writer.writeSpacer(12f);
                writer.writeMutedLine("Подпись ____________________");
                writer.writeMutedLine("Подпись ЧК ____________________");

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                writer.close();
                document.save(outputStream);
                return outputStream.toByteArray();
            } finally {
                writer.close();
            }
        } catch (IOException e) {
            throw new ApiException("SALARY_REPORT_PDF_EXPORT_FAILED", "Не удалось сформировать PDF-отчёт");
        }
    }

    private PDType0Font loadFont(PDDocument document, String classpathLocation) throws IOException {
        ClassPathResource resource = new ClassPathResource(classpathLocation);

        if (!resource.exists()) {
            throw new ApiException(
                    "PDF_FONT_NOT_FOUND",
                    "Не найден файл шрифта: " + classpathLocation
            );
        }

        try (InputStream inputStream = resource.getInputStream()) {
            return PDType0Font.load(document, inputStream);
        }
    }

    private String formatDate(java.time.LocalDate value) {
        return value == null ? "-" : value.format(DATE_FORMATTER);
    }

    private String formatTime(java.time.LocalTime value) {
        return value == null ? "-" : value.format(TIME_FORMATTER);
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "-" : value.trim();
    }

    private static class PdfWriter {
        private final PDDocument document;
        private final PDType0Font regular;
        private final PDType0Font bold;

        private PDPage page;
        private PDPageContentStream contentStream;
        private float cursorY;
        private final float pageWidth;
        private final float pageHeight;
        private final float contentWidth;

        private PdfWriter(PDDocument document, PDType0Font regular, PDType0Font bold) throws IOException {
            this.document = document;
            this.regular = regular;
            this.bold = bold;

            PDRectangle pageSize = LANDSCAPE_A4;
            this.pageWidth = pageSize.getWidth();
            this.pageHeight = pageSize.getHeight();
            this.contentWidth = pageWidth - (PAGE_MARGIN * 2);

            startNewPage();
        }

        private void close() throws IOException {
            if (contentStream != null) {
                contentStream.close();
                contentStream = null;
            }
        }

        private void startNewPage() throws IOException {
            if (contentStream != null) {
                contentStream.close();
            }

            page = new PDPage(LANDSCAPE_A4);
            document.addPage(page);
            contentStream = new PDPageContentStream(document, page);
            cursorY = pageHeight - PAGE_MARGIN;
        }

        private void ensureSpace(float requiredHeight) throws IOException {
            if (cursorY - requiredHeight < PAGE_MARGIN) {
                startNewPage();
            }
        }

        private void writeTitle(String text) throws IOException {
            ensureSpace(24f);
            writeTextLine(text, bold, TITLE_FONT_SIZE, PAGE_MARGIN, cursorY, Color.BLACK);
            cursorY -= 24f;
        }

        private void writeSection(String text) throws IOException {
            ensureSpace(20f);
            writeTextLine(text, bold, SECTION_FONT_SIZE, PAGE_MARGIN, cursorY, new Color(15, 23, 42));
            cursorY -= 20f;
        }

        private void writeNormalLine(String text) throws IOException {
            ensureSpace(LINE_HEIGHT);
            writeTextLine(text, regular, FONT_SIZE, PAGE_MARGIN, cursorY, Color.BLACK);
            cursorY -= LINE_HEIGHT;
        }

        private void writeMutedLine(String text) throws IOException {
            ensureSpace(LINE_HEIGHT);
            writeTextLine(text, regular, SMALL_FONT_SIZE, PAGE_MARGIN, cursorY, new Color(100, 116, 139));
            cursorY -= LINE_HEIGHT;
        }

        private void writeSpacer(float size) {
            cursorY -= size;
        }

        private void drawTable(String[] headers, List<String[]> rows, float[] widths) throws IOException {
            drawRow(headers, widths, true);

            for (String[] row : rows) {
                drawRow(row, widths, false);
            }
        }

        private void drawRow(String[] cells, float[] widths, boolean header) throws IOException {
            float fontSize = header ? SMALL_FONT_SIZE : FONT_SIZE;
            PDType0Font font = header ? bold : regular;

            List<List<String>> wrappedCells = new ArrayList<>();
            int maxLines = 1;

            for (int i = 0; i < cells.length; i++) {
                List<String> wrapped = wrapText(
                        cells[i] == null ? "-" : cells[i],
                        font,
                        fontSize,
                        widths[i] - (CELL_PADDING * 2)
                );
                wrappedCells.add(wrapped);
                maxLines = Math.max(maxLines, wrapped.size());
            }

            float rowHeight = (maxLines * LINE_HEIGHT) + (CELL_PADDING * 2);
            ensureSpace(rowHeight + 2f);

            float x = PAGE_MARGIN;
            float y = cursorY;

            for (int i = 0; i < cells.length; i++) {
                float cellWidth = widths[i];

                if (header) {
                    contentStream.setNonStrokingColor(new Color(241, 245, 249));
                    contentStream.addRect(x, y - rowHeight, cellWidth, rowHeight);
                    contentStream.fill();
                }

                contentStream.setStrokingColor(new Color(203, 213, 225));
                contentStream.addRect(x, y - rowHeight, cellWidth, rowHeight);
                contentStream.stroke();

                float textY = y - CELL_PADDING - 10f;
                for (String line : wrappedCells.get(i)) {
                    writeTextLine(line, font, fontSize, x + CELL_PADDING, textY, Color.BLACK);
                    textY -= LINE_HEIGHT;
                }

                x += cellWidth;
            }

            cursorY -= rowHeight;
        }

        private List<String> wrapText(String text, PDType0Font font, float fontSize, float maxWidth)
                throws IOException {
            List<String> lines = new ArrayList<>();
            String[] words = text.replace("\n", " ").split("\\s+");

            StringBuilder current = new StringBuilder();

            for (String word : words) {
                String candidate = current.isEmpty() ? word : current + " " + word;

                if (stringWidth(candidate, font, fontSize) <= maxWidth) {
                    current = new StringBuilder(candidate);
                } else {
                    if (!current.isEmpty()) {
                        lines.add(current.toString());
                    }

                    if (stringWidth(word, font, fontSize) <= maxWidth) {
                        current = new StringBuilder(word);
                    } else {
                        lines.add(word);
                        current = new StringBuilder();
                    }
                }
            }

            if (!current.isEmpty()) {
                lines.add(current.toString());
            }

            if (lines.isEmpty()) {
                lines.add("-");
            }

            return lines;
        }

        private float stringWidth(String text, PDType0Font font, float fontSize) throws IOException {
            return font.getStringWidth(text) / 1000f * fontSize;
        }

        private void writeTextLine(
                String text,
                PDType0Font font,
                float fontSize,
                float x,
                float y,
                Color color
        ) throws IOException {
            contentStream.beginText();
            contentStream.setFont(font, fontSize);
            contentStream.setNonStrokingColor(color);
            contentStream.newLineAtOffset(x, y);
            contentStream.showText(text);
            contentStream.endText();
        }
    }
}