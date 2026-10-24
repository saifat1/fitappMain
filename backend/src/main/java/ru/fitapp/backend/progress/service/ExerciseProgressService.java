package ru.fitapp.backend.progress.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.model.RepsMode;
import ru.fitapp.backend.notification.service.NotificationService;
import ru.fitapp.backend.progress.dto.ExerciseProgressDtos.Metric;
import ru.fitapp.backend.progress.dto.ExerciseProgressDtos.Point;
import ru.fitapp.backend.progress.dto.ExerciseProgressDtos.Previous;
import ru.fitapp.backend.progress.dto.ExerciseProgressDtos.Series;
import ru.fitapp.backend.progress.dto.ExerciseProgressDtos.Summary;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.trainingexercise.entity.TrainingExercise;
import ru.fitapp.backend.trainingexercise.entity.TrainingExerciseSet;
import ru.fitapp.backend.trainingexercise.repository.TrainingExerciseRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/**
 * FIT-76: progress by exercise, built from completed trainings (no extra tables). Exercises of different trainings
 * are «the same» when their titles match ignoring case, spaces and ё/е — there is no link to the template.
 * The trainer sees only their own trainings with the client, the client sees all of theirs.
 */
@Service
@Transactional(readOnly = true)
public class ExerciseProgressService {

    private static final Logger log = LoggerFactory.getLogger(ExerciseProgressService.class);
    private static final int RECENT_VALUES = 12;
    private static final Comparator<Training> CHRONOLOGICAL = Comparator
            .comparing(Training::getTrainingDate)
            .thenComparing(t -> t.getStartTime() != null ? t.getStartTime() : LocalTime.MIN)
            .thenComparing(Training::getId);

    private final TrainingExerciseRepository trainingExerciseRepository;
    private final NotificationService notificationService;

    public ExerciseProgressService(TrainingExerciseRepository trainingExerciseRepository, NotificationService notificationService) {
        this.trainingExerciseRepository = trainingExerciseRepository;
        this.notificationService = notificationService;
    }

    /** @param trainerId null — all of the client's trainings (the client's own view). */
    public List<Summary> getSummaries(Long clientId, Long trainerId) {
        List<Summary> result = new ArrayList<>();
        for (Series series : buildSeries(clientId, trainerId).values()) {
            List<Point> points = series.points();
            Point last = points.get(points.size() - 1);
            List<BigDecimal> recent = points.subList(Math.max(0, points.size() - RECENT_VALUES), points.size())
                    .stream().map(Point::value).toList();
            result.add(new Summary(series.key(), series.title(), series.metric(), points.size(),
                    points.get(0).value(), last.value(), last.date(), recent));
        }
        result.sort(Comparator.comparing(Summary::lastDate).reversed().thenComparing(Summary::title));
        return result;
    }

    public Optional<Series> getSeries(Long clientId, Long trainerId, String key) {
        return Optional.ofNullable(buildSeries(clientId, trainerId).get(normalizeKey(key)));
    }

    /** «В прошлый раз»: the latest completed training of the client (with this trainer) before {@code current}. */
    public Optional<Previous> getPrevious(Training current, String title) {
        if (current.getClient() == null) {
            return Optional.empty();
        }
        return findPrevious(current.getClient().getId(), current.getTrainer().getId(), title, current);
    }

    /** The same for a training that isn't saved yet (the «Новая тренировка» screen): the latest completed one. */
    public Optional<Previous> getLatest(Long clientId, Long trainerId, String title) {
        return findPrevious(clientId, trainerId, title, null);
    }

    private Optional<Previous> findPrevious(Long clientId, Long trainerId, String title, Training current) {
        if (title == null || title.isBlank()) {
            return Optional.empty();
        }
        String key = normalizeKey(title);
        return completedExercises(clientId, trainerId).stream()
                .filter(exercise -> key.equals(normalizeKey(exercise.getTitle())))
                .filter(exercise -> current == null || (!exercise.getTraining().getId().equals(current.getId())
                        && CHRONOLOGICAL.compare(exercise.getTraining(), current) < 0))
                .max(Comparator.comparing(TrainingExercise::getTraining, CHRONOLOGICAL))
                .map(exercise -> new Previous(
                        exercise.getTraining().getId(),
                        exercise.getTraining().getTrainingDate(),
                        stats(exercise).summary()
                ));
    }

    /**
     * After a training is completed: exercises where the client lifted more than ever before → one notification
     * «Новый рекорд: Жим лёжа — 75 кг». Never throws — completing the training must not fail because of it.
     */
    @Transactional
    public void notifyRecords(Training training) {
        try {
            AppUser client = training.getClient();
            if (client == null || client.getStatus() != UserStatus.ACTIVE || !client.isClaimedByClient()) {
                return;
            }
            List<String> records = new ArrayList<>();
            for (Series series : buildSeries(client.getId(), null).values()) {
                if (series.metric() != Metric.WEIGHT) {
                    continue;
                }
                series.points().stream()
                        .filter(point -> point.trainingId().equals(training.getId()) && point.record())
                        .findFirst()
                        .ifPresent(point -> records.add(series.title() + " — " + formatNumber(point.value()) + " кг"));
            }
            if (!records.isEmpty()) {
                notificationService.notifyPersonalRecord(training, String.join(", ", records));
            }
        } catch (Exception ex) {
            log.error("Failed to check records of training {}: {}", training.getId(), ex.getMessage());
        }
    }

    // ---------- Internals ----------

    private List<TrainingExercise> completedExercises(Long clientId, Long trainerId) {
        return trainingExerciseRepository.findAllForProgress(clientId, trainerId, TrainingStatus.COMPLETED);
    }

    /** Series by exercise key, points in chronological order; exercises without any number are left out. */
    private Map<String, Series> buildSeries(Long clientId, Long trainerId) {
        List<TrainingExercise> exercises = new ArrayList<>(completedExercises(clientId, trainerId));
        exercises.sort(Comparator.comparing(TrainingExercise::getTraining, CHRONOLOGICAL)
                .thenComparing(TrainingExercise::getOrderNum));

        // key → training id → merged stats (the same exercise twice in one training is one point)
        Map<String, Map<Long, Stats>> byKey = new LinkedHashMap<>();
        Map<String, String> titles = new LinkedHashMap<>();
        Map<Long, Training> trainings = new LinkedHashMap<>();
        for (TrainingExercise exercise : exercises) {
            String key = normalizeKey(exercise.getTitle());
            if (key.isEmpty()) {
                continue;
            }
            titles.put(key, exercise.getTitle().trim());
            trainings.put(exercise.getTraining().getId(), exercise.getTraining());
            byKey.computeIfAbsent(key, k -> new LinkedHashMap<>())
                    .merge(exercise.getTraining().getId(), stats(exercise), Stats::merge);
        }

        Map<String, Series> result = new LinkedHashMap<>();
        byKey.forEach((key, perTraining) -> {
            Metric metric = metricOf(perTraining.values());
            if (metric == null) {
                return;
            }
            List<Point> points = new ArrayList<>();
            BigDecimal best = null;
            for (Map.Entry<Long, Stats> entry : perTraining.entrySet()) {
                BigDecimal value = entry.getValue().value(metric);
                if (value == null) {
                    continue;
                }
                boolean record = best != null && value.compareTo(best) > 0;
                best = best == null || value.compareTo(best) > 0 ? value : best;
                Training training = trainings.get(entry.getKey());
                points.add(new Point(training.getId(), training.getTrainingDate(), value,
                        entry.getValue().volume(), entry.getValue().summary(), record));
            }
            if (!points.isEmpty()) {
                result.put(key, new Series(key, titles.get(key), metric, points));
            }
        });
        return result;
    }

    private static Metric metricOf(java.util.Collection<Stats> stats) {
        if (stats.stream().anyMatch(s -> s.bestWeight() != null)) {
            return Metric.WEIGHT;
        }
        if (stats.stream().anyMatch(s -> s.maxReps() != null)) {
            return Metric.REPS;
        }
        if (stats.stream().anyMatch(s -> s.duration() != null)) {
            return Metric.DURATION;
        }
        return null;
    }

    static String normalizeKey(String title) {
        if (title == null) {
            return "";
        }
        return title.trim().toLowerCase(Locale.ROOT).replace('ё', 'е').replaceAll("\\s+", " ");
    }

    private record Stats(BigDecimal bestWeight, BigDecimal volume, Integer maxReps, Integer duration, String summary) {

        BigDecimal value(Metric metric) {
            return switch (metric) {
                case WEIGHT -> bestWeight;
                case REPS -> maxReps != null ? BigDecimal.valueOf(maxReps) : null;
                case DURATION -> duration != null ? BigDecimal.valueOf(duration) : null;
            };
        }

        Stats merge(Stats other) {
            return new Stats(
                    max(bestWeight, other.bestWeight),
                    volume == null ? other.volume : other.volume == null ? volume : volume.add(other.volume),
                    maxReps == null ? other.maxReps : other.maxReps == null ? maxReps : Math.max(maxReps, other.maxReps),
                    duration == null ? other.duration : other.duration == null ? duration : Math.max(duration, other.duration),
                    summary + "; " + other.summary
            );
        }
    }

    /** Actual sets if the trainer filled them in, otherwise the plan: sets × reps at the exercise weight. */
    private static Stats stats(TrainingExercise exercise) {
        List<TrainingExerciseSet> details = exercise.getSetDetails();
        BigDecimal exerciseWeight = positive(exercise.getWeight());
        Integer duration = exercise.getDurationSeconds() != null && exercise.getDurationSeconds() > 0
                ? exercise.getDurationSeconds() : null;

        if (details != null && !details.isEmpty()) {
            BigDecimal bestWeight = null;
            BigDecimal volume = null;
            Integer maxReps = null;
            for (TrainingExerciseSet set : details) {
                BigDecimal weight = positive(set.getWeight()) != null ? positive(set.getWeight()) : exerciseWeight;
                Integer reps = set.getReps() != null && set.getReps() > 0 ? set.getReps() : null;
                bestWeight = max(bestWeight, weight);
                if (reps != null) {
                    maxReps = maxReps == null ? reps : Math.max(maxReps, reps);
                    if (weight != null) {
                        BigDecimal setVolume = weight.multiply(BigDecimal.valueOf(reps));
                        volume = volume == null ? setVolume : volume.add(setVolume);
                    }
                }
            }
            return new Stats(bestWeight, volume, maxReps, duration, describeSets(details, exerciseWeight, duration));
        }

        Integer sets = exercise.getSets() != null && exercise.getSets() > 0 ? exercise.getSets() : null;
        Integer reps = plannedReps(exercise);
        BigDecimal volume = exerciseWeight != null && reps != null
                ? exerciseWeight.multiply(BigDecimal.valueOf((long) reps * (sets != null ? sets : 1)))
                : null;
        Integer maxReps = exercise.getRepsMode() == RepsMode.RANGE && exercise.getRepsTo() != null ? exercise.getRepsTo() : reps;

        StringBuilder summary = new StringBuilder();
        String repsLabel = repsLabel(exercise);
        if (sets != null && repsLabel != null) {
            summary.append(sets).append("×").append(repsLabel);
        } else if (sets != null) {
            summary.append(sets).append(" ").append(sets == 1 ? "подход" : sets < 5 ? "подхода" : "подходов");
        } else if (repsLabel != null) {
            summary.append(repsLabel).append(" повт.");
        }
        if (exerciseWeight != null) {
            summary.append(summary.isEmpty() ? "" : " по ").append(formatNumber(exerciseWeight)).append(" кг");
        }
        if (duration != null) {
            summary.append(summary.isEmpty() ? "" : ", ").append(formatDuration(duration));
        }
        return new Stats(exerciseWeight, volume, maxReps, duration, summary.isEmpty() ? "без подходов" : summary.toString());
    }

    /** «3×8 по 70 кг» when all sets are equal, otherwise «8×70, 8×72,5, 6×75 кг». */
    private static String describeSets(List<TrainingExerciseSet> details, BigDecimal exerciseWeight, Integer duration) {
        List<String> parts = new ArrayList<>();
        boolean allEqual = true;
        TrainingExerciseSet first = details.get(0);
        for (TrainingExerciseSet set : details) {
            BigDecimal weight = positive(set.getWeight()) != null ? positive(set.getWeight()) : exerciseWeight;
            BigDecimal firstWeight = positive(first.getWeight()) != null ? positive(first.getWeight()) : exerciseWeight;
            allEqual &= Objects.equals(set.getReps(), first.getReps())
                    && (weight == null ? firstWeight == null : firstWeight != null && weight.compareTo(firstWeight) == 0);
            String reps = set.getReps() != null ? String.valueOf(set.getReps()) : "—";
            parts.add(weight != null ? reps + "×" + formatNumber(weight) : reps);
        }
        BigDecimal firstWeight = positive(first.getWeight()) != null ? positive(first.getWeight()) : exerciseWeight;
        String text;
        if (allEqual) {
            text = details.size() + "×" + (first.getReps() != null ? first.getReps() : "—")
                    + (firstWeight != null ? " по " + formatNumber(firstWeight) + " кг" : "");
        } else {
            text = String.join(", ", parts) + (firstWeight != null || exerciseWeight != null ? " кг" : "");
        }
        return duration != null ? text + ", " + formatDuration(duration) : text;
    }

    private static Integer plannedReps(TrainingExercise exercise) {
        if (exercise.getRepsMode() == RepsMode.EXACT) {
            return exercise.getRepsValue();
        }
        if (exercise.getRepsMode() == RepsMode.RANGE) {
            return exercise.getRepsFrom();
        }
        return null;
    }

    private static String repsLabel(TrainingExercise exercise) {
        if (exercise.getRepsMode() == RepsMode.EXACT && exercise.getRepsValue() != null) {
            return String.valueOf(exercise.getRepsValue());
        }
        if (exercise.getRepsMode() == RepsMode.RANGE && exercise.getRepsFrom() != null && exercise.getRepsTo() != null) {
            return exercise.getRepsFrom() + "–" + exercise.getRepsTo();
        }
        return null;
    }

    private static BigDecimal positive(BigDecimal value) {
        return value != null && value.signum() > 0 ? value : null;
    }

    private static BigDecimal max(BigDecimal a, BigDecimal b) {
        if (a == null) {
            return b;
        }
        return b == null || a.compareTo(b) >= 0 ? a : b;
    }

    /** 72.50 → «72,5». */
    static String formatNumber(BigDecimal value) {
        BigDecimal stripped = value.setScale(2, RoundingMode.HALF_UP).stripTrailingZeros();
        return (stripped.scale() < 0 ? stripped.setScale(0) : stripped).toPlainString().replace('.', ',');
    }

    private static String formatDuration(int seconds) {
        return seconds < 60 ? seconds + " сек" : (seconds / 60) + ":" + String.format("%02d", seconds % 60);
    }
}
