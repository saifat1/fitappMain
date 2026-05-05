package ru.fitapp.backend.availability.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityCalendarResponse;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityExceptionRequest;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityExceptionResponse;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityRuleRequest;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityRuleResponse;
import ru.fitapp.backend.availability.dto.TrainerAvailabilityRulesResponse;
import ru.fitapp.backend.availability.dto.TrainerAvailabilitySlotResponse;
import ru.fitapp.backend.availability.dto.UpdateTrainerAvailabilityRulesRequest;
import ru.fitapp.backend.availability.entity.TrainerAvailabilityException;
import ru.fitapp.backend.availability.entity.TrainerAvailabilityRule;
import ru.fitapp.backend.availability.model.AvailabilitySlotStatus;
import ru.fitapp.backend.availability.repository.TrainerAvailabilityExceptionRepository;
import ru.fitapp.backend.availability.repository.TrainerAvailabilityRuleRepository;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.trainerclient.repository.TrainerClientRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.user.service.UserService;
import java.util.stream.IntStream;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class TrainerAvailabilityService {

    private static final int MAX_RULES_PER_TRAINER = 7;
    private static final int MAX_SLOTS_PER_RESPONSE = 1000;

    private final TrainerAvailabilityRuleRepository trainerAvailabilityRuleRepository;
    private final TrainerAvailabilityExceptionRepository trainerAvailabilityExceptionRepository;
    private final TrainingRepository trainingRepository;
    private final TrainerClientRepository trainerClientRepository;
    private final CurrentUserService currentUserService;
    private final UserService userService;

    public TrainerAvailabilityService(
            TrainerAvailabilityRuleRepository trainerAvailabilityRuleRepository,
            TrainerAvailabilityExceptionRepository trainerAvailabilityExceptionRepository,
            TrainingRepository trainingRepository,
            TrainerClientRepository trainerClientRepository,
            CurrentUserService currentUserService,
            UserService userService
    ) {
        this.trainerAvailabilityRuleRepository = trainerAvailabilityRuleRepository;
        this.trainerAvailabilityExceptionRepository = trainerAvailabilityExceptionRepository;
        this.trainingRepository = trainingRepository;
        this.trainerClientRepository = trainerClientRepository;
        this.currentUserService = currentUserService;
        this.userService = userService;
    }

    public void initializeDefaultRulesForTrainer(AppUser trainer) {
        initializeDefaultRulesIfEmpty(trainer);
    }

    public TrainerAvailabilityRulesResponse getRulesForCurrentTrainer() {
        AppUser trainer = currentUserService.getCurrentTrainer();

        initializeDefaultRulesIfEmpty(trainer);

        List<TrainerAvailabilityRuleResponse> rules = trainerAvailabilityRuleRepository
                .findAllByTrainerIdOrderByDayOfWeekAscStartTimeAsc(trainer.getId())
                .stream()
                .map(this::toRuleResponse)
                .toList();

        List<TrainerAvailabilityExceptionResponse> exceptions = trainerAvailabilityExceptionRepository
                .findAllByTrainerIdOrderByExceptionDateAscStartTimeAsc(trainer.getId())
                .stream()
                .map(this::toExceptionResponse)
                .toList();

        return new TrainerAvailabilityRulesResponse()
                .setRules(rules)
                .setExceptions(exceptions);
    }

    public TrainerAvailabilityRulesResponse replaceRulesForCurrentTrainer(UpdateTrainerAvailabilityRulesRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        List<TrainerAvailabilityRuleRequest> requestedRules = request.getRules() == null
                ? List.of()
                : request.getRules();

        List<TrainerAvailabilityExceptionRequest> requestedExceptions = request.getExceptions() == null
                ? List.of()
                : request.getExceptions();

        validateRules(requestedRules);
        validateExceptions(requestedExceptions);

        trainerAvailabilityRuleRepository.deleteAllByTrainerId(trainer.getId());
        trainerAvailabilityExceptionRepository.deleteAllByTrainerId(trainer.getId());

        List<TrainerAvailabilityRule> rulesToSave = requestedRules.stream()
                .map(item -> new TrainerAvailabilityRule()
                        .setTrainer(trainer)
                        .setDayOfWeek(item.getDayOfWeek())
                        .setStartTime(item.getStartTime())
                        .setEndTime(item.getEndTime())
                        .setSlotDurationMinutes(item.getSlotDurationMinutes())
                        .setActive(Boolean.TRUE.equals(item.getActive())))
                .toList();

        List<TrainerAvailabilityRuleResponse> savedRules = trainerAvailabilityRuleRepository
                .saveAll(rulesToSave)
                .stream()
                .sorted(Comparator
                        .comparing(TrainerAvailabilityRule::getDayOfWeek)
                        .thenComparing(TrainerAvailabilityRule::getStartTime))
                .map(this::toRuleResponse)
                .toList();

        List<TrainerAvailabilityException> exceptionsToSave = requestedExceptions.stream()
                .map(item -> new TrainerAvailabilityException()
                        .setTrainer(trainer)
                        .setExceptionDate(item.getDate())
                        .setStartTime(item.getStartTime())
                        .setEndTime(item.getEndTime())
                        .setComment(item.getComment()))
                .toList();

        List<TrainerAvailabilityExceptionResponse> savedExceptions = trainerAvailabilityExceptionRepository
                .saveAll(exceptionsToSave)
                .stream()
                .sorted(Comparator
                        .comparing(TrainerAvailabilityException::getExceptionDate)
                        .thenComparing(TrainerAvailabilityException::getStartTime))
                .map(this::toExceptionResponse)
                .toList();

        return new TrainerAvailabilityRulesResponse()
                .setRules(savedRules)
                .setExceptions(savedExceptions);
    }

    @Transactional(readOnly = true)
    public TrainerAvailabilityCalendarResponse getCalendarForCurrentClient(Long trainerId, LocalDate from, LocalDate to) {
        AppUser client = getCurrentClient();

        validateRange(from, to);

        AppUser trainer = userService.getById(trainerId);
        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ApiException("TRAINER_NOT_FOUND", "Тренер не найден");
        }

        boolean linked = trainerClientRepository.existsByTrainerIdAndClientId(trainerId, client.getId());
        if (!linked) {
            throw new ApiException("ACCESS_DENIED", "Клиент не привязан к этому тренеру");
        }

        List<TrainerAvailabilityRule> rules = trainerAvailabilityRuleRepository
                .findAllByTrainerIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(trainerId);

        validateLoadedRules(rules);

        List<TrainerAvailabilityException> exceptions = trainerAvailabilityExceptionRepository
                .findAllByTrainerIdAndExceptionDateBetweenOrderByExceptionDateAscStartTimeAsc(
                        trainerId,
                        from,
                        to
                );

        List<Training> trainings = trainingRepository
                .findAllByTrainerIdAndTrainingDateBetweenOrderByTrainingDateAscStartTimeAsc(trainerId, from, to);

        List<TrainerAvailabilitySlotResponse> slots = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        LocalDate date = from;
        while (!date.isAfter(to)) {
            int dayOfWeek = date.getDayOfWeek().getValue();

            for (TrainerAvailabilityRule rule : rules) {
                if (!rule.getDayOfWeek().equals(dayOfWeek)) {
                    continue;
                }

                LocalDateTime ruleStart = LocalDateTime.of(date, rule.getStartTime());
                LocalDateTime ruleEnd = LocalDateTime.of(date, rule.getEndTime());
                LocalDateTime cursor = ruleStart;
                int durationMinutes = rule.getSlotDurationMinutes();

                while (!cursor.plusMinutes(durationMinutes).isAfter(ruleEnd)) {
                    LocalDateTime slotStart = cursor;
                    LocalDateTime slotEnd = slotStart.plusMinutes(durationMinutes);

                    AvailabilitySlotStatus status;
                    if (slotEnd.isBefore(now)) {
                        status = AvailabilitySlotStatus.PAST;
                    } else if (isBlockedByException(exceptions, date, slotStart.toLocalTime(), slotEnd.toLocalTime())) {
                        status = AvailabilitySlotStatus.BUSY;
                    } else if (isBusy(trainings, date, slotStart.toLocalTime(), slotEnd.toLocalTime())) {
                        status = AvailabilitySlotStatus.BUSY;
                    } else {
                        status = AvailabilitySlotStatus.FREE;
                    }

                    slots.add(new TrainerAvailabilitySlotResponse()
                            .setStart(slotStart)
                            .setEnd(slotEnd)
                            .setStatus(status));

                    if (slots.size() > MAX_SLOTS_PER_RESPONSE) {
                        throw new ApiException(
                                "VALIDATION_ERROR",
                                "Сформировано слишком много слотов. Проверь настройки доступности тренера."
                        );
                    }

                    cursor = slotEnd;
                }
            }

            date = date.plusDays(1);
        }

        return new TrainerAvailabilityCalendarResponse()
                .setTrainerId(trainerId)
                .setFrom(from)
                .setTo(to)
                .setSlots(slots);
    }

    @Transactional(readOnly = true)
    public boolean isExactSlotAvailableForClient(
            Long trainerId,
            Long clientId,
            LocalDateTime requestedStart,
            LocalDateTime requestedEnd
    ) {
        if (requestedStart == null || requestedEnd == null || !requestedEnd.isAfter(requestedStart)) {
            return false;
        }

        boolean linked = trainerClientRepository.existsByTrainerIdAndClientId(trainerId, clientId);
        if (!linked) {
            return false;
        }

        List<TrainerAvailabilityRule> rules = trainerAvailabilityRuleRepository
                .findAllByTrainerIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(trainerId);

        validateLoadedRules(rules);

        List<Training> trainings = trainingRepository
                .findAllByTrainerIdAndTrainingDateBetweenOrderByTrainingDateAscStartTimeAsc(
                        trainerId,
                        requestedStart.toLocalDate(),
                        requestedStart.toLocalDate()
                );

        List<TrainerAvailabilityException> exceptions = trainerAvailabilityExceptionRepository
                .findAllByTrainerIdAndExceptionDateBetweenOrderByExceptionDateAscStartTimeAsc(
                        trainerId,
                        requestedStart.toLocalDate(),
                        requestedStart.toLocalDate()
                );

        int dayOfWeek = requestedStart.getDayOfWeek().getValue();
        LocalDate date = requestedStart.toLocalDate();
        LocalTime start = requestedStart.toLocalTime();
        LocalTime end = requestedEnd.toLocalTime();

        for (TrainerAvailabilityRule rule : rules) {
            if (!rule.getDayOfWeek().equals(dayOfWeek)) {
                continue;
            }

            LocalDateTime ruleStart = LocalDateTime.of(date, rule.getStartTime());
            LocalDateTime ruleEnd = LocalDateTime.of(date, rule.getEndTime());
            LocalDateTime cursor = ruleStart;

            while (!cursor.plusMinutes(rule.getSlotDurationMinutes()).isAfter(ruleEnd)) {
                LocalDateTime slotStart = cursor;
                LocalDateTime slotEnd = slotStart.plusMinutes(rule.getSlotDurationMinutes());

                if (slotStart.toLocalTime().equals(start) && slotEnd.toLocalTime().equals(end)) {
                    if (isBlockedByException(exceptions, date, slotStart.toLocalTime(), slotEnd.toLocalTime())) {
                        return false;
                    }

                    return !isBusy(trainings, date, slotStart.toLocalTime(), slotEnd.toLocalTime());
                }

                cursor = slotEnd;
            }
        }

        return false;
    }

    private void validateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new ApiException("VALIDATION_ERROR", "Период from/to обязателен");
        }
        if (to.isBefore(from)) {
            throw new ApiException("VALIDATION_ERROR", "Дата to не может быть раньше from");
        }
        if (from.plusDays(31).isBefore(to)) {
            throw new ApiException("VALIDATION_ERROR", "Слишком большой диапазон дат");
        }
    }

    private void validateRules(List<TrainerAvailabilityRuleRequest> rules) {
        if (rules.size() > MAX_RULES_PER_TRAINER) {
            throw new ApiException("VALIDATION_ERROR", "Допускается не более 7 правил доступности");
        }

        Set<Integer> usedDays = new HashSet<>();

        for (TrainerAvailabilityRuleRequest rule : rules) {
            if (rule.getDayOfWeek() == null || rule.getDayOfWeek() < 1 || rule.getDayOfWeek() > 7) {
                throw new ApiException("VALIDATION_ERROR", "dayOfWeek должен быть от 1 до 7");
            }

            if (!usedDays.add(rule.getDayOfWeek())) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "В рамках MVP допускается только одно правило на один день недели"
                );
            }

            if (rule.getStartTime() == null || rule.getEndTime() == null) {
                throw new ApiException("VALIDATION_ERROR", "В правиле не заполнено время");
            }
            if (!rule.getEndTime().isAfter(rule.getStartTime())) {
                throw new ApiException("VALIDATION_ERROR", "Время окончания должно быть больше времени начала");
            }
            if (rule.getSlotDurationMinutes() == null || rule.getSlotDurationMinutes() < 15) {
                throw new ApiException("VALIDATION_ERROR", "Длительность слота должна быть не меньше 15 минут");
            }

            long totalMinutes = Duration.between(rule.getStartTime(), rule.getEndTime()).toMinutes();
            if (totalMinutes < rule.getSlotDurationMinutes()) {
                throw new ApiException("VALIDATION_ERROR", "Интервал правила меньше длительности слота");
            }
            if (totalMinutes % rule.getSlotDurationMinutes() != 0) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "Интервал правила должен делиться на длительность слота без остатка"
                );
            }
        }
    }

    private void initializeDefaultRulesIfEmpty(AppUser trainer) {
        if (trainer == null || trainer.getId() == null) {
            throw new ApiException("TRAINER_NOT_FOUND", "Тренер не найден");
        }

        if (trainerAvailabilityRuleRepository.existsByTrainerId(trainer.getId())) {
            return;
        }

        List<TrainerAvailabilityRule> defaultRules = IntStream.rangeClosed(1, 7)
                .mapToObj(dayOfWeek -> new TrainerAvailabilityRule()
                        .setTrainer(trainer)
                        .setDayOfWeek(dayOfWeek)
                        .setStartTime(LocalTime.of(9, 0))
                        .setEndTime(LocalTime.of(23, 0))
                        .setSlotDurationMinutes(60)
                        .setActive(true))
                .toList();

        trainerAvailabilityRuleRepository.saveAll(defaultRules);
    }

    private void validateExceptions(List<TrainerAvailabilityExceptionRequest> exceptions) {
        for (TrainerAvailabilityExceptionRequest exception : exceptions) {
            if (exception.getDate() == null) {
                throw new ApiException("VALIDATION_ERROR", "У исключения не заполнена дата");
            }
            if (exception.getStartTime() == null || exception.getEndTime() == null) {
                throw new ApiException("VALIDATION_ERROR", "У исключения не заполнено время");
            }
            if (!exception.getEndTime().isAfter(exception.getStartTime())) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "У исключения время окончания должно быть больше времени начала"
                );
            }
        }
    }

    private void validateLoadedRules(List<TrainerAvailabilityRule> rules) {
        if (rules.size() > MAX_RULES_PER_TRAINER) {
            throw new ApiException(
                    "VALIDATION_ERROR",
                    "У тренера сохранено слишком много правил доступности. Допускается не более 7."
            );
        }

        Set<Integer> usedDays = new HashSet<>();
        for (TrainerAvailabilityRule rule : rules) {
            if (!usedDays.add(rule.getDayOfWeek())) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "У тренера обнаружены дубли правил доступности по одному дню недели"
                );
            }

            if (rule.getSlotDurationMinutes() == null || rule.getSlotDurationMinutes() < 15) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "У тренера обнаружена некорректная длительность слота"
                );
            }

            if (rule.getStartTime() == null
                    || rule.getEndTime() == null
                    || !rule.getEndTime().isAfter(rule.getStartTime())) {
                throw new ApiException(
                        "VALIDATION_ERROR",
                        "У тренера обнаружен некорректный временной интервал доступности"
                );
            }
        }
    }

    private boolean isBlockedByException(
            List<TrainerAvailabilityException> exceptions,
            LocalDate date,
            LocalTime slotStart,
            LocalTime slotEnd
    ) {
        return exceptions.stream()
                .filter(item -> date.equals(item.getExceptionDate()))
                .anyMatch(item ->
                        item.getStartTime() != null
                                && item.getEndTime() != null
                                && item.getStartTime().isBefore(slotEnd)
                                && item.getEndTime().isAfter(slotStart)
                );
    }

    private boolean isBusy(List<Training> trainings, LocalDate date, LocalTime slotStart, LocalTime slotEnd) {
        return trainings.stream()
                .filter(training -> training.getStatus() != TrainingStatus.CANCELLED)
                .filter(training -> date.equals(training.getTrainingDate()))
                .anyMatch(training ->
                        training.getStartTime() != null
                                && training.getEndTime() != null
                                && training.getStartTime().isBefore(slotEnd)
                                && training.getEndTime().isAfter(slotStart)
                );
    }

    private TrainerAvailabilityRuleResponse toRuleResponse(TrainerAvailabilityRule rule) {
        return new TrainerAvailabilityRuleResponse()
                .setId(rule.getId())
                .setDayOfWeek(rule.getDayOfWeek())
                .setStartTime(rule.getStartTime())
                .setEndTime(rule.getEndTime())
                .setSlotDurationMinutes(rule.getSlotDurationMinutes())
                .setActive(rule.isActive());
    }

    private TrainerAvailabilityExceptionResponse toExceptionResponse(TrainerAvailabilityException exception) {
        return new TrainerAvailabilityExceptionResponse()
                .setId(exception.getId())
                .setDate(exception.getExceptionDate())
                .setStartTime(exception.getStartTime())
                .setEndTime(exception.getEndTime())
                .setComment(exception.getComment());
    }

    private AppUser getCurrentClient() {
        AppUser currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() != UserRole.CLIENT) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только клиенту");
        }
        return currentUser;
    }
}