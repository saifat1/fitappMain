package ru.fitapp.backend.trainer.profile.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.trainer.profile.dto.TrainerReportClientRowResponse;
import ru.fitapp.backend.trainer.profile.dto.TrainerReportSummaryResponse;
import ru.fitapp.backend.trainer.profile.dto.TrainerReportsResponse;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
public class TrainerReportService {

    private static final LocalDate DEFAULT_FROM = LocalDate.of(2000, 1, 1);
    private static final LocalDate DEFAULT_TO = LocalDate.of(2100, 12, 31);

    private final CurrentUserService currentUserService;
    private final TrainingRepository trainingRepository;

    public TrainerReportService(
            CurrentUserService currentUserService,
            TrainingRepository trainingRepository
    ) {
        this.currentUserService = currentUserService;
        this.trainingRepository = trainingRepository;
    }

    public TrainerReportsResponse getReports(
            LocalDate from,
            LocalDate to,
            Long clientId,
            TrainingStatus status
    ) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        LocalDate effectiveFrom = from != null ? from : DEFAULT_FROM;
        LocalDate effectiveTo = to != null ? to : DEFAULT_TO;

        if (effectiveFrom.isAfter(effectiveTo)) {
            throw new ApiException("INVALID_DATE_RANGE", "Дата начала периода не может быть позже даты окончания");
        }

        List<Training> trainings = trainingRepository
                .findAllByTrainerIdAndTrainingDateBetweenOrderByTrainingDateDescStartTimeDesc(
                        trainer.getId(),
                        effectiveFrom,
                        effectiveTo
                );

        List<Training> filtered = trainings.stream()
                .filter(training -> clientId == null || training.getClient().getId().equals(clientId))
                .filter(training -> status == null || training.getStatus() == status)
                .toList();

        TrainerReportSummaryResponse summary = buildSummary(filtered);
        List<TrainerReportClientRowResponse> rows = buildRows(filtered);

        return new TrainerReportsResponse()
                .setSummary(summary)
                .setRows(rows);
    }

    private TrainerReportSummaryResponse buildSummary(List<Training> trainings) {
        long completed = trainings.stream()
                .filter(training -> training.getStatus() == TrainingStatus.COMPLETED)
                .count();

        long cancelled = trainings.stream()
                .filter(training -> training.getStatus() == TrainingStatus.CANCELLED)
                .count();

        long planned = trainings.stream()
                .filter(training -> training.getStatus() == TrainingStatus.PLANNED)
                .count();

        long clientsWithTrainings = trainings.stream()
                .map(training -> training.getClient().getId())
                .distinct()
                .count();

        return new TrainerReportSummaryResponse()
                .setTotalTrainings(trainings.size())
                .setCompletedTrainings(completed)
                .setCancelledTrainings(cancelled)
                .setPlannedTrainings(planned)
                .setClientsWithTrainings(clientsWithTrainings);
    }

    private List<TrainerReportClientRowResponse> buildRows(List<Training> trainings) {
        Map<Long, ClientAccumulator> grouped = new HashMap<>();

        for (Training training : trainings) {
            AppUser client = training.getClient();

            ClientAccumulator accumulator = grouped.computeIfAbsent(
                    client.getId(),
                    clientId -> new ClientAccumulator(
                            client.getId(),
                            buildClientName(client),
                            client.getEmail()
                    )
            );

            accumulator.totalTrainings++;

            switch (training.getStatus()) {
                case COMPLETED -> accumulator.completedTrainings++;
                case CANCELLED -> accumulator.cancelledTrainings++;
                case PLANNED -> accumulator.plannedTrainings++;
            }

            if (accumulator.lastTrainingDate == null
                    || training.getTrainingDate().isAfter(accumulator.lastTrainingDate)) {
                accumulator.lastTrainingDate = training.getTrainingDate();
            }
        }

        return grouped.values().stream()
                .map(accumulator -> new TrainerReportClientRowResponse()
                        .setClientId(accumulator.clientId)
                        .setClientName(accumulator.clientName)
                        .setClientEmail(accumulator.clientEmail)
                        .setTotalTrainings(accumulator.totalTrainings)
                        .setCompletedTrainings(accumulator.completedTrainings)
                        .setCancelledTrainings(accumulator.cancelledTrainings)
                        .setPlannedTrainings(accumulator.plannedTrainings)
                        .setLastTrainingDate(accumulator.lastTrainingDate))
                .sorted(Comparator
                        .comparing(TrainerReportClientRowResponse::getLastTrainingDate,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(
                                row -> Optional.ofNullable(row.getClientName()).orElse(""),
                                String.CASE_INSENSITIVE_ORDER
                        ))
                .collect(Collectors.toList());
    }

    private String buildClientName(AppUser client) {
        String fullName = Stream.of(client.getFirstName(), client.getLastName())
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.joining(" "));

        return fullName.isBlank() ? "Клиент без имени" : fullName;
    }

    private static class ClientAccumulator {
        private final Long clientId;
        private final String clientName;
        private final String clientEmail;
        private long totalTrainings;
        private long completedTrainings;
        private long cancelledTrainings;
        private long plannedTrainings;
        private LocalDate lastTrainingDate;

        private ClientAccumulator(Long clientId, String clientName, String clientEmail) {
            this.clientId = clientId;
            this.clientName = clientName;
            this.clientEmail = clientEmail;
        }
    }
}