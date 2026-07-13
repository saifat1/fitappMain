package ru.fitapp.backend.trainer.salaryreport.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.contract.entity.ClientContract;
import ru.fitapp.backend.dutyslot.dto.TrainerDutySlotResponse;
import ru.fitapp.backend.dutyslot.entity.TrainerDutySlot;
import ru.fitapp.backend.dutyslot.repository.TrainerDutySlotRepository;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.model.TrainingType;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.trainer.salaryreport.dto.TrainerSalaryReportDutyRowResponse;
import ru.fitapp.backend.trainer.salaryreport.dto.TrainerSalaryReportResponse;
import ru.fitapp.backend.trainer.salaryreport.dto.TrainerSalaryReportSummaryResponse;
import ru.fitapp.backend.trainer.salaryreport.dto.TrainerSalaryReportTrainingRowResponse;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
public class TrainerSalaryReportService {

    private final CurrentUserService currentUserService;
    private final TrainingRepository trainingRepository;
    private final TrainerDutySlotRepository trainerDutySlotRepository;

    public TrainerSalaryReportService(
            CurrentUserService currentUserService,
            TrainingRepository trainingRepository,
            TrainerDutySlotRepository trainerDutySlotRepository
    ) {
        this.currentUserService = currentUserService;
        this.trainingRepository = trainingRepository;
        this.trainerDutySlotRepository = trainerDutySlotRepository;
    }

    public TrainerSalaryReportResponse getCurrentTrainerReport(int year, int month) {
        validateYearMonth(year, month);

        AppUser trainer = currentUserService.getCurrentTrainer();
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate from = yearMonth.atDay(1);
        LocalDate to = yearMonth.atEndOfMonth();

        List<Training> completedTrainings =
                trainingRepository.findAllByTrainerIdAndTrainingDateBetweenAndStatusOrderByTrainingDateAscStartTimeAsc(
                        trainer.getId(),
                        from,
                        to,
                        TrainingStatus.COMPLETED
                );

        List<TrainerDutySlot> dutySlots =
                trainerDutySlotRepository.findAllByTrainerIdAndDutyDateBetweenOrderByDutyDateAscStartTimeAsc(
                        trainer.getId(),
                        from,
                        to
                );

        List<TrainerSalaryReportTrainingRowResponse> trainingRows = completedTrainings.stream()
                .map(this::toTrainingRow)
                .toList();

        List<TrainerSalaryReportDutyRowResponse> dutyRows = dutySlots.stream()
                .map(this::toDutyRow)
                .toList();

        TrainerSalaryReportSummaryResponse summary = new TrainerSalaryReportSummaryResponse()
                .setPersonalTrainingCount(trainingRows.size())
                .setExtraTrainingCount(0)
                .setDutyHoursCount(dutyRows.size());

        return new TrainerSalaryReportResponse()
                .setTrainerId(trainer.getId())
                .setTrainerName(buildPersonName(trainer, "Тренер"))
                .setYear(year)
                .setMonth(month)
                .setSummary(summary)
                .setTrainingRows(trainingRows)
                .setDutyRows(dutyRows);
    }

    private TrainerSalaryReportTrainingRowResponse toTrainingRow(Training training) {
        AppUser client = training.getClient();
        ClientContract contract = training.getContract();

        return new TrainerSalaryReportTrainingRowResponse()
                .setTrainingId(training.getId())
                .setDate(training.getTrainingDate())
                .setStartTime(training.getStartTime())
                .setEndTime(training.getEndTime())
                .setClientId(client.getId())
                .setClientName(buildPersonName(client, "Клиент без имени"))
                .setTrainingTypeLabel(training.getTrainingType() == TrainingType.INDEPENDENT ? "СТ" : "ПТ")
                .setContractNumber(contract != null ? contract.getContractNumber() : null)
                .setContractEndDate(contract != null ? contract.getEndDate() : null)
                .setContractTotalTrainings(contract != null ? contract.getTotalTrainings() : null)
                .setContractRemainingTrainings(contract != null ? contract.getRemainingTrainings() : null);
    }

    private TrainerSalaryReportDutyRowResponse toDutyRow(TrainerDutySlot dutySlot) {
        return new TrainerSalaryReportDutyRowResponse()
                .setDutySlotId(dutySlot.getId())
                .setDate(dutySlot.getDutyDate())
                .setStartTime(dutySlot.getStartTime())
                .setEndTime(dutySlot.getEndTime())
                .setTypeLabel("Дежурство");
    }

    private String buildPersonName(AppUser user, String fallback) {
        String fullName = Stream.of(user.getFirstName(), user.getLastName())
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(Collectors.joining(" "));

        return fullName.isBlank() ? fallback : fullName;
    }

    private void validateYearMonth(int year, int month) {
        if (year < 2020 || year > 2100) {
            throw new ApiException("INVALID_YEAR", "Некорректный год отчёта");
        }

        if (month < 1 || month > 12) {
            throw new ApiException("INVALID_MONTH", "Месяц должен быть в диапазоне от 1 до 12");
        }
    }
}