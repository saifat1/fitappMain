package ru.fitapp.backend.training.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.contract.service.ClientContractService;
import ru.fitapp.backend.notification.service.NotificationService;
import ru.fitapp.backend.progress.service.ExerciseProgressService;
import ru.fitapp.backend.training.dto.CreateTrainingRequest;
import ru.fitapp.backend.training.dto.TrainingResponse;
import ru.fitapp.backend.training.dto.UpdateTrainingRequest;
import ru.fitapp.backend.subscription.service.SubscriptionAccessService;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.CancelledBy;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.model.TrainingType;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.analytics.model.AnalyticsEventType;
import ru.fitapp.backend.analytics.service.AnalyticsService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final CurrentUserService currentUserService;
    private final TrainerClientService trainerClientService;
    private final AnalyticsService analyticsService;
    private final NotificationService notificationService;
    private final ClientContractService clientContractService;
    private final SubscriptionAccessService subscriptionAccessService;
    private final ExerciseProgressService exerciseProgressService;

    public TrainingService(TrainingRepository trainingRepository,
                           CurrentUserService currentUserService,
                           TrainerClientService trainerClientService,
                           AnalyticsService analyticsService,
                           NotificationService notificationService,
                           ClientContractService clientContractService,
                           SubscriptionAccessService subscriptionAccessService,
                           ExerciseProgressService exerciseProgressService) {
        this.trainingRepository = trainingRepository;
        this.currentUserService = currentUserService;
        this.trainerClientService = trainerClientService;
        this.analyticsService = analyticsService;
        this.notificationService = notificationService;
        this.clientContractService = clientContractService;
        this.subscriptionAccessService = subscriptionAccessService;
        this.exerciseProgressService = exerciseProgressService;
    }

    public TrainingResponse createTraining(CreateTrainingRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        validateTimeRange(request.getStartTime(), request.getEndTime());

        AppUser client = trainerClientService.getClientOfTrainer(trainer.getId(), request.getClientId());
        subscriptionAccessService.assertClientWorkable(trainer, client.getId());
        TrainingType trainingType = parseTrainingType(request.getTrainingType());

        String title = normalizeNote(request.getTitle());
        if (trainingType == TrainingType.CIRCUIT && title == null) {
            throw new ApiException("VALIDATION_ERROR", "Укажите название круговой тренировки");
        }

        Training training = new Training()
                .setTrainer(trainer)
                .setClient(client)
                .setTrainingDate(request.getTrainingDate())
                .setStartTime(request.getStartTime())
                .setEndTime(request.getEndTime())
                .setStatus(TrainingStatus.PLANNED)
                .setTrainingType(trainingType)
                .setFocusMuscleGroups(trainingType == TrainingType.INDEPENDENT ? join(request.getFocusMuscleGroups()) : null)
                .setTitle(title)
                .setDescription(normalizeNote(request.getDescription()))
                .setRounds(trainingType == TrainingType.CIRCUIT ? defaultRounds(request.getRounds()) : null)
                .setRoundRestSeconds(trainingType == TrainingType.CIRCUIT ? normalizeRest(request.getRoundRestSeconds()) : null)
                .setTrainerNote(normalizeNote(request.getTrainerNote()));

        Training saved = trainingRepository.save(training);

        // Self-guided trainings don't draw from the paid contract balance,
        // so there's nothing to warn about for them.
        if (trainingType.drawsFromContract()
                && clientContractService.getSummary(client.getId(), trainer.getId()).isExhausted()) {
            notificationService.notifyTrainingContractExceeded(saved);
        }

        analyticsService.trackUserAction(
                trainer,
                AnalyticsEventType.TRAINING_CREATED,
                "training",
                String.valueOf(saved.getId()),
                null
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TrainingResponse> getTrainings(LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        AppUser currentUser = currentUserService.getCurrentUser();

        if (currentUser.getRole() == UserRole.TRAINER) {
            return trainingRepository
                    .findAllByTrainerIdAndTrainingDateBetweenOrderByTrainingDateAscStartTimeAsc(
                            currentUser.getId(),
                            from,
                            to
                    )
                    .stream()
                    .filter(t -> isVisibleInCalendar(t, UserRole.TRAINER))
                    .map(this::mapToResponse)
                    .toList();
        }

        if (currentUser.getRole() == UserRole.CLIENT) {
            return trainingRepository
                    .findAllByClientIdAndTrainingDateBetweenOrderByTrainingDateAscStartTimeAsc(
                            currentUser.getId(),
                            from,
                            to
                    )
                    .stream()
                    .filter(t -> isVisibleInCalendar(t, UserRole.CLIENT))
                    .map(this::mapToResponse)
                    .toList();
        }

        throw new ApiException("ACCESS_DENIED", "Недостаточно прав для просмотра тренировок");
    }

    /**
     * Per the 13.07.2026 decision with Katerina:
     *  - trainer-cancelled trainings never appear in the TRAINER's own
     *    calendar (they go straight to history) — but they DO appear in the
     *    CLIENT's calendar, marked "Отменена".
     *  - client-cancelled trainings appear (as "Отменена") in both calendars
     *    right up until their slot time passes, then quietly drop out of the
     *    schedule for everyone — the record stays intact for history/reports.
     *  - manually dismissed ("Удалить") trainings never show again for
     *    anyone, regardless of who cancelled them — this includes deleted
     *    COMPLETED trainings, which keep their status for contract/reports.
     */
    private boolean isVisibleInCalendar(Training training, UserRole viewerRole) {
        if (training.isHiddenFromSchedule()) {
            return false;
        }
        if (training.getStatus() != TrainingStatus.CANCELLED) {
            return true;
        }
        if (training.getCancelledBy() == CancelledBy.TRAINER && viewerRole == UserRole.TRAINER) {
            return false;
        }

        LocalTime startTime = training.getStartTime() != null ? training.getStartTime() : LocalTime.MIDNIGHT;
        LocalDateTime slotStart = LocalDateTime.of(training.getTrainingDate(), startTime);
        return slotStart.isAfter(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public TrainingResponse getTraining(Long trainingId) {
        AppUser currentUser = currentUserService.getCurrentUser();
        Training training = getAccessibleTrainingOrThrow(trainingId, currentUser);

        return mapToResponse(training);
    }

    public TrainingResponse updateTraining(Long trainingId, UpdateTrainingRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        Training training = getTrainerOwnedTrainingOrThrow(trainingId, trainer.getId());

        LocalDate targetDate = request.getTrainingDate() != null ? request.getTrainingDate() : training.getTrainingDate();
        LocalTime targetStart = request.getStartTime() != null ? request.getStartTime() : training.getStartTime();
        LocalTime targetEnd = request.getEndTime() != null ? request.getEndTime() : training.getEndTime();

        validateDate(targetDate);
        validateTimeRange(targetStart, targetEnd);

        if (request.getTrainingDate() != null) {
            training.setTrainingDate(request.getTrainingDate());
        }

        if (request.getStartTime() != null) {
            training.setStartTime(request.getStartTime());
        }

        if (request.getEndTime() != null) {
            training.setEndTime(request.getEndTime());
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            training.setStatus(parseStatus(request.getStatus()));
        }

        if (request.getTrainerNote() != null) {
            training.setTrainerNote(normalizeNote(request.getTrainerNote()));
        }

        if (training.getTrainingType() == TrainingType.CIRCUIT) {
            if (request.getRounds() != null) {
                training.setRounds(request.getRounds());
            }

            if (request.getRoundRestSeconds() != null) {
                training.setRoundRestSeconds(normalizeRest(request.getRoundRestSeconds()));
            }
        }

        Training saved = trainingRepository.save(training);
        return mapToResponse(saved);
    }

    public void cancelTraining(Long trainingId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        Training training = getTrainerOwnedTrainingOrThrow(trainingId, trainer.getId());

        // "Удалить" on a training that already took place only removes it from the
        // schedule: it stays COMPLETED, stays drawn from the contract and in the
        // salary report. Undoing a completion is a separate action ("Вернуть в план").
        if (training.getStatus() == TrainingStatus.COMPLETED) {
            training.setHiddenFromSchedule(true);
            trainingRepository.save(training);
            return;
        }

        if (training.getContract() != null) {
            clientContractService.refundOne(training.getContract());
            training.setContract(null);
        }

        training.setStatus(TrainingStatus.CANCELLED);
        training.setCancelledBy(CancelledBy.TRAINER);
        Training saved = trainingRepository.save(training);
        notificationService.notifyTrainingCancelledByTrainer(saved);

        analyticsService.trackUserAction(
                trainer,
                AnalyticsEventType.TRAINING_CANCELLED,
                "training",
                String.valueOf(training.getId()),
                null
        );
    }

    /**
     * Client-initiated cancellation of their own upcoming training. Mirrors
     * cancelTraining's trainer-side flow but is reachable only for the
     * training's own client, and notifies the trainer instead.
     */
    public void cancelForCurrentClient(Long trainingId) {
        Training training = getClientOwnedTrainingEntity(trainingId);

        if (training.getStatus() == TrainingStatus.CANCELLED) {
            throw new ApiException("TRAINING_ALREADY_CANCELLED", "Тренировка уже отменена");
        }
        if (training.getStatus() == TrainingStatus.COMPLETED) {
            throw new ApiException("TRAINING_ALREADY_COMPLETED", "Нельзя отменить завершённую тренировку");
        }

        LocalDateTime trainingStart = LocalDateTime.of(training.getTrainingDate(), training.getStartTime());
        if (!trainingStart.isAfter(LocalDateTime.now())) {
            throw new ApiException("TRAINING_IN_PAST", "Нельзя отменить прошедшую тренировку");
        }

        training.setStatus(TrainingStatus.CANCELLED);
        training.setCancelledBy(CancelledBy.CLIENT);
        Training saved = trainingRepository.save(training);
        notificationService.notifyTrainingCancelledByClient(saved);
    }

    /**
     * Trainer-only "Удалить" swipe action on a cancelled training row —
     * clears it from the schedule immediately instead of waiting for its
     * slot to pass. The record itself is untouched, so history/reports are
     * unaffected.
     */
    public void hideFromSchedule(Long trainingId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        Training training = getTrainerOwnedTrainingOrThrow(trainingId, trainer.getId());

        if (training.getStatus() != TrainingStatus.CANCELLED) {
            throw new ApiException("TRAINING_NOT_CANCELLED", "Скрыть из расписания можно только отменённую тренировку");
        }

        training.setHiddenFromSchedule(true);
        trainingRepository.save(training);
    }

    @Transactional(readOnly = true)
    public Training getAccessibleTrainingEntity(Long trainingId) {
        AppUser currentUser = currentUserService.getCurrentUser();
        return getAccessibleTrainingOrThrow(trainingId, currentUser);
    }

    @Transactional(readOnly = true)
    public Training getTrainingEntity(Long trainingId) {
        return trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ApiException("TRAINING_NOT_FOUND", "Тренировка не найдена"));
    }

    @Transactional(readOnly = true)
    public Training getClientOwnedTrainingEntity(Long trainingId) {
        AppUser client = currentUserService.getCurrentUser();

        if (client.getRole() != UserRole.CLIENT) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только клиенту");
        }

        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ApiException("TRAINING_NOT_FOUND", "Тренировка не найдена"));

        if (!training.getClient().getId().equals(client.getId())) {
            throw new ApiException("ACCESS_DENIED", "Нет доступа к тренировке");
        }

        return training;
    }

    @Transactional(readOnly = true)
    public Training getTrainerOwnedTrainingEntity(Long trainingId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        return getTrainerOwnedTrainingOrThrow(trainingId, trainer.getId());
    }

    private Training getAccessibleTrainingOrThrow(Long trainingId, AppUser currentUser) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ApiException("TRAINING_NOT_FOUND", "Тренировка не найдена"));

        boolean allowed =
                (currentUser.getRole() == UserRole.TRAINER && training.getTrainer().getId().equals(currentUser.getId())) ||
                        (currentUser.getRole() == UserRole.CLIENT && training.getClient().getId().equals(currentUser.getId()));

        if (!allowed) {
            throw new ApiException("ACCESS_DENIED", "Нет доступа к тренировке");
        }

        return training;
    }

    private Training getTrainerOwnedTrainingOrThrow(Long trainingId, Long trainerId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ApiException("TRAINING_NOT_FOUND", "Тренировка не найдена"));

        if (!training.getTrainer().getId().equals(trainerId)) {
            throw new ApiException("ACCESS_DENIED", "Нет доступа к тренировке");
        }

        return training;
    }

    private TrainingResponse mapToResponse(Training training) {
        return new TrainingResponse()
                .setId(training.getId())
                .setTrainerId(training.getTrainer().getId())
                .setClientId(training.getClient().getId())
                .setClientEmail(training.getClient().getEmail())
                .setClientFirstName(training.getClient().getFirstName())
                .setClientLastName(training.getClient().getLastName())
                .setTrainingDate(training.getTrainingDate())
                .setStartTime(training.getStartTime())
                .setEndTime(training.getEndTime())
                .setStatus(training.getStatus().name())
                .setCancelledBy(training.getCancelledBy() != null ? training.getCancelledBy().name() : null)
                .setTrainingType(training.getTrainingType().name())
                .setFocusMuscleGroups(split(training.getFocusMuscleGroups()))
                .setTitle(training.getTitle())
                .setDescription(training.getDescription())
                .setRounds(training.getRounds())
                .setRoundRestSeconds(training.getRoundRestSeconds())
                .setTrainerNote(training.getTrainerNote())
                .setClientNote(training.getClientNote())
                .setContractId(training.getContract() != null ? training.getContract().getId() : null)
                .setContractNumber(training.getContract() != null ? training.getContract().getContractNumber() : null)
                .setCreatedAt(training.getCreatedAt())
                .setUpdatedAt(training.getUpdatedAt());
    }

    private void validateDateRange(LocalDate from, LocalDate to) {
        validateDate(from);
        validateDate(to);

        if (to.isBefore(from)) {
            throw new ApiException("INVALID_DATE_RANGE", "Некорректный диапазон дат");
        }
    }

    private Integer defaultRounds(Integer rounds) {
        return rounds != null ? rounds : 1;
    }

    /** 0 / empty rest means "no rest timer between rounds". */
    private Integer normalizeRest(Integer seconds) {
        return seconds == null || seconds == 0 ? null : seconds;
    }

    private void validateDate(LocalDate date) {
        if (date == null) {
            throw new ApiException("VALIDATION_ERROR", "Дата обязательна");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime != null && endTime != null && endTime.isBefore(startTime)) {
            throw new ApiException("INVALID_TRAINING_TIME", "Время окончания не может быть раньше времени начала");
        }
        if (!endTime.isAfter(startTime)) {
            throw new ApiException(
                    "INVALID_TIME_RANGE",
                    "Время окончания должно быть позже времени начала"
            );
        }
    }

    private TrainingStatus parseStatus(String status) {
        try {
            return TrainingStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException("INVALID_TRAINING_STATUS", "Некорректный статус тренировки");
        }
    }

    private TrainingType parseTrainingType(String value) {
        if (value == null || value.isBlank()) {
            return TrainingType.PERSONAL;
        }
        try {
            return TrainingType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException("INVALID_TRAINING_TYPE", "Некорректный тип тренировки");
        }
    }

    private String join(List<String> codes) {
        if (codes == null || codes.isEmpty()) return null;
        return String.join(",", codes);
    }

    private List<String> split(String value) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.stream(value.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private String normalizeNote(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    public TrainingResponse completeTraining(Long trainingId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        Training training = getTrainerOwnedTrainingOrThrow(trainingId, trainer.getId());

        training.setStatus(TrainingStatus.COMPLETED);

        if (training.getTrainingType().drawsFromContract()) {
            clientContractService
                    .consumeOneForCompletedTraining(training.getClient(), trainer)
                    .ifPresent(training::setContract);
        }

        Training saved = trainingRepository.save(training);
        notificationService.notifyTrainingCompleted(saved);
        exerciseProgressService.notifyRecords(saved);

        analyticsService.trackUserAction(
                trainer,
                AnalyticsEventType.TRAINING_COMPLETED,
                "training",
                String.valueOf(saved.getId()),
                null
        );

        return mapToResponse(saved);
    }

    public TrainingResponse restoreTrainingToPlanned(Long trainingId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        Training training = getTrainerOwnedTrainingOrThrow(trainingId, trainer.getId());

        if (training.getStatus() != TrainingStatus.COMPLETED) {
            throw new ApiException(
                    "TRAINING_STATUS_INVALID_FOR_RESTORE",
                    "Вернуть в запланированные можно только завершённую тренировку"
            );
        }

        if (training.getContract() != null) {
            clientContractService.refundOne(training.getContract());
            training.setContract(null);
        }

        training.setStatus(TrainingStatus.PLANNED);
        training.setHiddenFromSchedule(false);
        Training saved = trainingRepository.save(training);
        return mapToResponse(saved);
    }

}