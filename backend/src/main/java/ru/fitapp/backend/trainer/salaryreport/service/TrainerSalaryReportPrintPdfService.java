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

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TrainerSalaryReportPrintPdfService {

    private static final PDRectangle LANDSCAPE_A4 =
            new PDRectangle(PDRectangle.A4.getHeight(), PDRectangle.A4.getWidth());

    private static final float PAGE_WIDTH = LANDSCAPE_A4.getWidth();
    private static final float PAGE_HEIGHT = LANDSCAPE_A4.getHeight();

    private static final float PAGE_MARGIN = 18f;
    private static final float COLUMN_GAP = 10f;
    private static final float ROW_GAP = 12f;

    private static final float SECTION_WIDTH =
            (PAGE_WIDTH - PAGE_MARGIN * 2 - COLUMN_GAP) / 2f;
    private static final float SECTION_HEIGHT = 252f;

    private static final int SECTIONS_PER_PAGE = 4;
    private static final int ROWS_PER_SECTION = 16;

    private static final float HEADER_TOP_FONT_SIZE = 11f;
    private static final float SECTION_TITLE_FONT_SIZE = 9f;
    private static final float HEADER_FONT_SIZE = 8f;
    private static final float CELL_FONT_SIZE = 7f;
    private static final float SMALL_FONT_SIZE = 6.5f;

    private static final float SECTION_HEADER_HEIGHT = 34f;
    private static final float TABLE_HEADER_HEIGHT = 14f;
    private static final float DATA_ROW_HEIGHT = 12f;
    private static final float CELL_PADDING = 2.5f;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private static final String[] COLUMN_HEADERS = {
            "Время",
            "ФИО",
            "Вид",
            "Договор",
            "Дата окончания",
            "Подпись",
            "Подпись ЧК"
    };

    private static final float[] RAW_COLUMN_WIDTHS = {
            34f, 110f, 42f, 68f, 60f, 48f, 48f
    };

    private final TrainerSalaryReportService trainerSalaryReportService;

    public TrainerSalaryReportPrintPdfService(
            TrainerSalaryReportService trainerSalaryReportService
    ) {
        this.trainerSalaryReportService = trainerSalaryReportService;
    }

    public byte[] exportCurrentTrainerPrintPdf(int year, int month) {
        TrainerSalaryReportResponse report =
                trainerSalaryReportService.getCurrentTrainerReport(year, month);

        List<DaySection> sections = buildDaySections(report);
        List<List<DaySection>> pages = chunkSections(sections, SECTIONS_PER_PAGE);

        if (pages.isEmpty()) {
            pages = List.of(new ArrayList<>());
        }

        try (PDDocument document = new PDDocument()) {
            PDType0Font regular = loadFont(document, "fonts/DejaVuSans.ttf");
            PDType0Font bold = loadFont(document, "fonts/DejaVuSans-Bold.ttf");

            PdfCanvas canvas = new PdfCanvas(document, regular, bold);

            try {
                for (int pageIndex = 0; pageIndex < pages.size(); pageIndex++) {
                    List<DaySection> pageSections = pages.get(pageIndex);
                    canvas.startPage();

                    for (int sectionIndex = 0; sectionIndex < SECTIONS_PER_PAGE; sectionIndex++) {
                        float x = PAGE_MARGIN + (sectionIndex % 2) * (SECTION_WIDTH + COLUMN_GAP);
                        float yTop = PAGE_HEIGHT - PAGE_MARGIN
                                - (sectionIndex / 2) * (SECTION_HEIGHT + ROW_GAP);

                        DaySection section =
                                sectionIndex < pageSections.size() ? pageSections.get(sectionIndex) : null;

                        drawSection(canvas, report, x, yTop, SECTION_WIDTH, SECTION_HEIGHT, section);
                    }

                    if (pageIndex == pages.size() - 1) {
                        drawFooter(canvas, report);
                    }
                }

                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                canvas.close();
                document.save(outputStream);
                return outputStream.toByteArray();
            } finally {
                canvas.close();
            }
        } catch (IOException e) {
            throw new ApiException(
                    "SALARY_REPORT_PRINT_PDF_EXPORT_FAILED",
                    "Не удалось сформировать печатную PDF-форму"
            );
        }
    }

    private void drawSection(
            PdfCanvas canvas,
            TrainerSalaryReportResponse report,
            float x,
            float yTop,
            float width,
            float height,
            DaySection section
    ) throws IOException {
        float yBottom = yTop - height;

        canvas.drawRect(x, yBottom, width, height, new Color(40, 40, 40));

        canvas.drawText(
                "Инструктор: " + safe(report.getTrainerName()),
                x + 4f,
                yTop - 9f,
                canvas.bold(),
                HEADER_FONT_SIZE,
                Color.BLACK
        );

        String dateLabel = section == null
                ? "Дата: —"
                : "Дата: " + formatDate(section.date()) + (section.continuation() ? " (продолжение)" : "");

        canvas.drawText(
                dateLabel,
                x + 4f,
                yTop - 21f,
                canvas.bold(),
                SECTION_TITLE_FONT_SIZE,
                Color.BLACK
        );

        canvas.drawLine(
                x,
                yTop - SECTION_HEADER_HEIGHT,
                x + width,
                yTop - SECTION_HEADER_HEIGHT,
                new Color(40, 40, 40)
        );

        float[] columnWidths = scaleColumnWidths(width);
        float tableTop = yTop - SECTION_HEADER_HEIGHT;
        float tableHeaderBottom = tableTop - TABLE_HEADER_HEIGHT;

        drawTableRow(
                canvas,
                x,
                tableTop,
                TABLE_HEADER_HEIGHT,
                columnWidths,
                COLUMN_HEADERS,
                true
        );

        List<PrintRow> rows = section == null ? List.of() : section.rows();

        for (int rowIndex = 0; rowIndex < ROWS_PER_SECTION; rowIndex++) {
            float rowTop = tableHeaderBottom - rowIndex * DATA_ROW_HEIGHT;
            PrintRow row = rowIndex < rows.size() ? rows.get(rowIndex) : null;

            String[] values = row == null
                    ? new String[]{"", "", "", "", "", "", ""}
                    : new String[]{
                    formatTime(row.startTime()),
                    safe(row.clientName()),
                    safe(row.typeLabel()),
                    safe(row.contractNumber()),
                    formatDate(row.contractEndDate()),
                    "",
                    ""
            };

            drawTableRow(
                    canvas,
                    x,
                    rowTop,
                    DATA_ROW_HEIGHT,
                    columnWidths,
                    values,
                    false
            );
        }
    }

    private void drawTableRow(
            PdfCanvas canvas,
            float x,
            float rowTop,
            float rowHeight,
            float[] columnWidths,
            String[] values,
            boolean header
    ) throws IOException {
        float currentX = x;

        if (header) {
            canvas.fillRect(
                    x,
                    rowTop - rowHeight,
                    sum(columnWidths),
                    rowHeight,
                    new Color(245, 245, 245)
            );
        }

        for (int i = 0; i < columnWidths.length; i++) {
            float cellWidth = columnWidths[i];

            canvas.drawRect(
                    currentX,
                    rowTop - rowHeight,
                    cellWidth,
                    rowHeight,
                    new Color(60, 60, 60)
            );

            String text = i < values.length ? values[i] : "";
            String fitted = fitText(
                    text,
                    header ? canvas.bold() : canvas.regular(),
                    header ? SMALL_FONT_SIZE : CELL_FONT_SIZE,
                    cellWidth - CELL_PADDING * 2
            );

            canvas.drawText(
                    fitted,
                    currentX + CELL_PADDING,
                    rowTop - rowHeight + 3.2f,
                    header ? canvas.bold() : canvas.regular(),
                    header ? SMALL_FONT_SIZE : CELL_FONT_SIZE,
                    Color.BLACK
            );

            currentX += cellWidth;
        }
    }

    private void drawFooter(PdfCanvas canvas, TrainerSalaryReportResponse report) throws IOException {
        float y = 18f;

        canvas.drawLine(
                PAGE_MARGIN,
                y + 22f,
                PAGE_WIDTH - PAGE_MARGIN,
                y + 22f,
                new Color(120, 120, 120)
        );

        canvas.drawText(
                "Кол-во ПТ: " + report.getSummary().getPersonalTrainingCount(),
                PAGE_MARGIN,
                y + 12f,
                canvas.bold(),
                HEADER_FONT_SIZE,
                Color.BLACK
        );

        canvas.drawText(
                "Кол-во ЭТ: " + report.getSummary().getExtraTrainingCount(),
                PAGE_MARGIN + 120f,
                y + 12f,
                canvas.bold(),
                HEADER_FONT_SIZE,
                Color.BLACK
        );

        canvas.drawText(
                "Кол-во дежур. часов: " + report.getSummary().getDutyHoursCount(),
                PAGE_MARGIN + 230f,
                y + 12f,
                canvas.bold(),
                HEADER_FONT_SIZE,
                Color.BLACK
        );

        canvas.drawText(
                "Подпись ____________________",
                PAGE_WIDTH - 260f,
                y + 12f,
                canvas.regular(),
                HEADER_FONT_SIZE,
                Color.BLACK
        );

        canvas.drawText(
                "Подпись ЧК ____________________",
                PAGE_WIDTH - 260f,
                y,
                canvas.regular(),
                HEADER_FONT_SIZE,
                Color.BLACK
        );
    }

    private List<DaySection> buildDaySections(TrainerSalaryReportResponse report) {
        Map<LocalDate, List<PrintRow>> rowsByDate = new LinkedHashMap<>();

        for (TrainerSalaryReportTrainingRowResponse row : report.getTrainingRows()) {
            rowsByDate
                    .computeIfAbsent(row.getDate(), key -> new ArrayList<>())
                    .add(new PrintRow(
                            row.getDate(),
                            row.getStartTime(),
                            row.getEndTime(),
                            row.getClientName(),
                            row.getTrainingTypeLabel(),
                            row.getContractNumber(),
                            row.getContractEndDate()
                    ));
        }

        for (TrainerSalaryReportDutyRowResponse row : report.getDutyRows()) {
            rowsByDate
                    .computeIfAbsent(row.getDate(), key -> new ArrayList<>())
                    .add(new PrintRow(
                            row.getDate(),
                            row.getStartTime(),
                            row.getEndTime(),
                            "",
                            row.getTypeLabel(),
                            "",
                            null
                    ));
        }

        List<Map.Entry<LocalDate, List<PrintRow>>> sortedDays = new ArrayList<>(rowsByDate.entrySet());
        sortedDays.sort(Map.Entry.comparingByKey());

        List<DaySection> sections = new ArrayList<>();

        for (Map.Entry<LocalDate, List<PrintRow>> entry : sortedDays) {
            List<PrintRow> dayRows = entry.getValue();
            dayRows.sort(
                    Comparator.comparing(PrintRow::startTime)
                            .thenComparing(PrintRow::typeLabel)
                            .thenComparing(PrintRow::clientName)
            );

            if (dayRows.isEmpty()) {
                sections.add(new DaySection(entry.getKey(), false, List.of()));
                continue;
            }

            for (int i = 0; i < dayRows.size(); i += ROWS_PER_SECTION) {
                sections.add(new DaySection(
                        entry.getKey(),
                        i > 0,
                        new ArrayList<>(dayRows.subList(i, Math.min(i + ROWS_PER_SECTION, dayRows.size())))
                ));
            }
        }

        return sections;
    }

    private List<List<DaySection>> chunkSections(List<DaySection> sections, int chunkSize) {
        List<List<DaySection>> result = new ArrayList<>();

        for (int i = 0; i < sections.size(); i += chunkSize) {
            result.add(new ArrayList<>(sections.subList(i, Math.min(i + chunkSize, sections.size()))));
        }

        return result;
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

    private float[] scaleColumnWidths(float sectionWidth) {
        float total = 0f;
        for (float rawWidth : RAW_COLUMN_WIDTHS) {
            total += rawWidth;
        }

        float scale = sectionWidth / total;
        float[] result = new float[RAW_COLUMN_WIDTHS.length];

        for (int i = 0; i < RAW_COLUMN_WIDTHS.length; i++) {
            result[i] = RAW_COLUMN_WIDTHS[i] * scale;
        }

        return result;
    }

    private String fitText(String text, PDType0Font font, float fontSize, float maxWidth)
            throws IOException {
        String safeText = text == null ? "" : text.trim();

        if (safeText.isEmpty()) {
            return "";
        }

        if (stringWidth(safeText, font, fontSize) <= maxWidth) {
            return safeText;
        }

        String ellipsis = "...";
        String candidate = safeText;

        while (!candidate.isEmpty() &&
                stringWidth(candidate + ellipsis, font, fontSize) > maxWidth) {
            candidate = candidate.substring(0, candidate.length() - 1);
        }

        return candidate.isEmpty() ? "" : candidate + ellipsis;
    }

    private float stringWidth(String text, PDType0Font font, float fontSize) throws IOException {
        return font.getStringWidth(text) / 1000f * fontSize;
    }

    private float sum(float[] values) {
        float sum = 0f;
        for (float value : values) {
            sum += value;
        }
        return sum;
    }

    private String formatDate(LocalDate value) {
        return value == null ? "" : value.format(DATE_FORMATTER);
    }

    private String formatTime(LocalTime value) {
        return value == null ? "" : value.format(TIME_FORMATTER);
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private record PrintRow(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            String clientName,
            String typeLabel,
            String contractNumber,
            LocalDate contractEndDate
    ) {
    }

    private record DaySection(
            LocalDate date,
            boolean continuation,
            List<PrintRow> rows
    ) {
    }

    private static class PdfCanvas {
        private final PDDocument document;
        private final PDType0Font regular;
        private final PDType0Font bold;

        private PDPageContentStream stream;

        private PdfCanvas(PDDocument document, PDType0Font regular, PDType0Font bold) {
            this.document = document;
            this.regular = regular;
            this.bold = bold;
        }

        private void startPage() throws IOException {
            close();

            PDPage page = new PDPage(LANDSCAPE_A4);
            document.addPage(page);
            stream = new PDPageContentStream(document, page);
        }

        private PDType0Font regular() {
            return regular;
        }

        private PDType0Font bold() {
            return bold;
        }

        private void drawRect(float x, float y, float width, float height, Color strokeColor)
                throws IOException {
            stream.setStrokingColor(strokeColor);
            stream.addRect(x, y, width, height);
            stream.stroke();
        }

        private void fillRect(float x, float y, float width, float height, Color fillColor)
                throws IOException {
            stream.setNonStrokingColor(fillColor);
            stream.addRect(x, y, width, height);
            stream.fill();
        }

        private void drawLine(float x1, float y1, float x2, float y2, Color color)
                throws IOException {
            stream.setStrokingColor(color);
            stream.moveTo(x1, y1);
            stream.lineTo(x2, y2);
            stream.stroke();
        }

        private void drawText(
                String text,
                float x,
                float y,
                PDType0Font font,
                float fontSize,
                Color color
        ) throws IOException {
            if (text == null || text.isEmpty()) {
                return;
            }

            stream.beginText();
            stream.setFont(font, fontSize);
            stream.setNonStrokingColor(color);
            stream.newLineAtOffset(x, y);
            stream.showText(text);
            stream.endText();
        }

        private void close() throws IOException {
            if (stream != null) {
                stream.close();
                stream = null;
            }
        }
    }
}