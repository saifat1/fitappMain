package ru.fitapp.backend.progress.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** FIT-76: exercise progress of a client — the list, one exercise's chart and the «в прошлый раз» hint. */
public final class ExerciseProgressDtos {

    private ExerciseProgressDtos() {
    }

    /** What the chart shows: best weight (kg), else max reps, else duration (seconds). */
    public enum Metric {
        WEIGHT,
        REPS,
        DURATION
    }

    /** One completed training: the metric value, volume (weight × reps over all sets) and «3×8 по 70 кг». */
    public record Point(
            Long trainingId,
            LocalDate date,
            BigDecimal value,
            BigDecimal volume,
            String summary,
            boolean record
    ) {
    }

    /** A row of the «Прогресс» list: first → last value and the recent values for the mini chart. */
    public record Summary(
            String key,
            String title,
            Metric metric,
            int trainings,
            BigDecimal firstValue,
            BigDecimal lastValue,
            LocalDate lastDate,
            List<BigDecimal> recentValues
    ) {
    }

    public record Series(String key, String title, Metric metric, List<Point> points) {
    }

    /** The same exercise in the client's last completed training before this one. */
    public record Previous(Long trainingId, LocalDate date, String summary) {
    }
}
