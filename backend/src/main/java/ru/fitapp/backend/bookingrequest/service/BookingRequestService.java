package ru.fitapp.backend.bookingrequest.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.availability.service.TrainerAvailabilityService;
import ru.fitapp.backend.bookingrequest.dto.BookingRequestResponse;
import ru.fitapp.backend.bookingrequest.dto.CreateBookingRequest;
import ru.fitapp.backend.bookingrequest.entity.BookingRequest;
import ru.fitapp.backend.bookingrequest.model.BookingRequestStatus;
import ru.fitapp.backend.bookingrequest.repository.BookingRequestRepository;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.contract.service.ClientContractService;
import ru.fitapp.backend.notification.service.NotificationService;
import ru.fitapp.backend.subscription.service.SubscriptionAccessService;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.CancelledBy;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.trainerclient.repository.TrainerClientRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.user.service.UserService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BookingRequestService {

    private final BookingRequestRepository bookingRequestRepository;
    private final TrainerClientRepository trainerClientRepository;
    private final CurrentUserService currentUserService;
    private final TrainerAvailabilityService trainerAvailabilityService;
    private final TrainingRepository trainingRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    private final ClientContractService clientContractService;
    private final SubscriptionAccessService subscriptionAccessService;

    public BookingRequestService(
            BookingRequestRepository bookingRequestRepository,
            TrainerClientRepository trainerClientRepository,
            CurrentUserService currentUserService,
            TrainerAvailabilityService trainerAvailabilityService,
            TrainingRepository trainingRepository,
            UserService userService,
            NotificationService notificationService,
            ClientContractService clientContractService,
            SubscriptionAccessService subscriptionAccessService
    ) {
        this.subscriptionAccessService = subscriptionAccessService;
        this.bookingRequestRepository = bookingRequestRepository;
        this.trainerClientRepository = trainerClientRepository;
        this.currentUserService = currentUserService;
        this.trainerAvailabilityService = trainerAvailabilityService;
        this.trainingRepository = trainingRepository;
        this.userService = userService;
        this.notificationService = notificationService;
        this.clientContractService = clientContractService;
    }

    public BookingRequestResponse createForCurrentClient(CreateBookingRequest request) {
        AppUser client = getCurrentClient();
        AppUser trainer = userService.getById(request.getTrainerId());

        if (trainer.getRole() != UserRole.TRAINER) {
            throw new ApiException("TRAINER_NOT_FOUND", "Тренер не найден");
        }

        boolean linked = trainerClientRepository.existsByTrainerIdAndClientId(trainer.getId(), client.getId());
        if (!linked) {
            throw new ApiException("ACCESS_DENIED", "Клиент не привязан к этому тренеру");
        }

        Training originalTraining = resolveOriginalTraining(request.getOriginalTrainingId(), client, trainer);

        // A reschedule doesn't add a training: the original is still PLANNED and
        // already counted in the summary, so the exhaustion check would block
        // clients with exactly enough balance.
        if (originalTraining == null
                && clientContractService.getSummary(client.getId(), trainer.getId()).isExhausted()) {
            throw new ApiException(
                    "CONTRACT_EXHAUSTED",
                    "У вас закончились оплаченные тренировки по договору. Обратитесь к тренеру."
            );
        }

        if (request.getRequestedStart() == null || request.getRequestedEnd() == null) {
            throw new ApiException("VALIDATION_ERROR", "requestedStart/requestedEnd обязательны");
        }
        if (!request.getRequestedEnd().isAfter(request.getRequestedStart())) {
            throw new ApiException("VALIDATION_ERROR", "requestedEnd должен быть больше requestedStart");
        }
        if (!request.getRequestedStart().isAfter(LocalDateTime.now())) {
            throw new ApiException("VALIDATION_ERROR", "Нельзя создать запрос на прошедший слот");
        }

        boolean slotAvailable = trainerAvailabilityService.isExactSlotAvailableForClient(
                trainer.getId(),
                client.getId(),
                request.getRequestedStart(),
                request.getRequestedEnd()
        );
        if (!slotAvailable) {
            throw new ApiException("SLOT_NOT_AVAILABLE", "Выбранный слот недоступен");
        }

        boolean duplicatePending = bookingRequestRepository
                .existsByTrainerIdAndClientIdAndRequestedStartAndRequestedEndAndStatus(
                        trainer.getId(),
                        client.getId(),
                        request.getRequestedStart(),
                        request.getRequestedEnd(),
                        BookingRequestStatus.PENDING
                );
        if (duplicatePending) {
            throw new ApiException("DUPLICATE_REQUEST", "Запрос на этот слот уже создан");
        }

        Long trainerId = request.getTrainerId();

        boolean alreadyExists = bookingRequestRepository
                .existsByClientIdAndTrainerIdAndRequestedStartAndRequestedEndAndStatusIn(
                        client.getId(),
                        trainerId,
                        request.getRequestedStart(),
                        request.getRequestedEnd(),
                        List.of(
                                BookingRequestStatus.PENDING,
                                BookingRequestStatus.APPROVED
                        )
                );

        if (alreadyExists) {
            throw new ApiException(
                    "BOOKING_REQUEST_ALREADY_EXISTS",
                    "Запрос на этот слот уже существует"
            );
        }

        BookingRequest bookingRequest = new BookingRequest()
                .setTrainer(trainer)
                .setClient(client)
                .setOriginalTraining(originalTraining)
                .setRequestedStart(request.getRequestedStart())
                .setRequestedEnd(request.getRequestedEnd())
                .setStatus(BookingRequestStatus.PENDING)
                .setClientComment(normalizeNullableText(request.getClientComment()));

        BookingRequest saved = bookingRequestRepository.save(bookingRequest);
        notificationService.notifyBookingRequestCreated(saved);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingRequestResponse> getCurrentClientRequests() {
        AppUser client = getCurrentClient();

        return bookingRequestRepository.findAllByClientIdOrderByCreatedAtDesc(client.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingRequestResponse> getCurrentTrainerRequests() {
        AppUser trainer = currentUserService.getCurrentTrainer();

        return bookingRequestRepository.findAllByTrainerIdOrderByCreatedAtDesc(trainer.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BookingRequestResponse approveForCurrentTrainer(Long requestId, String trainerComment) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        BookingRequest bookingRequest = bookingRequestRepository.findByIdAndTrainerId(requestId, trainer.getId())
                .orElseThrow(() -> new ApiException("BOOKING_REQUEST_NOT_FOUND", "Запрос на запись не найден"));

        if (bookingRequest.getStatus() != BookingRequestStatus.PENDING) {
            throw new ApiException("BOOKING_REQUEST_ALREADY_REVIEWED", "Запрос уже обработан");
        }

        // Reschedule: free the original slot first, so a shift that overlaps the
        // old time isn't reported as "slot taken". If the overlap check below
        // fails, the transaction rolls this back.
        Training original = bookingRequest.getOriginalTraining();
        if (original != null && original.getStatus() == TrainingStatus.PLANNED) {
            original
                    .setStatus(TrainingStatus.CANCELLED)
                    .setCancelledBy(CancelledBy.CLIENT)
                    .setHiddenFromSchedule(true);
            trainingRepository.saveAndFlush(original);
        }

        long overlappingTrainings = trainingRepository.countOverlappingTrainings(
                trainer.getId(),
                bookingRequest.getRequestedStart().toLocalDate(),
                bookingRequest.getRequestedStart().toLocalTime(),
                bookingRequest.getRequestedEnd().toLocalTime(),
                TrainingStatus.CANCELLED
        );

        if (overlappingTrainings > 0) {
            throw new ApiException("SLOT_ALREADY_TAKEN", "Слот уже занят");
        }

        subscriptionAccessService.assertClientWorkable(trainer, bookingRequest.getClient().getId());

        Training training = new Training()
                .setTrainer(bookingRequest.getTrainer())
                .setClient(bookingRequest.getClient())
                .setTrainingDate(bookingRequest.getRequestedStart().toLocalDate())
                .setStartTime(bookingRequest.getRequestedStart().toLocalTime())
                .setEndTime(bookingRequest.getRequestedEnd().toLocalTime())
                .setStatus(TrainingStatus.PLANNED)
                .setTrainerNote(original != null
                        ? "Перенесено по запросу клиента"
                        : "Создано из подтвержденного запроса на запись")
                .setClientNote(bookingRequest.getClientComment());

        if (original != null) {
            training.setTrainingType(original.getTrainingType());
        }

        trainingRepository.save(training);

        if (clientContractService.getSummary(bookingRequest.getClient().getId(), trainer.getId()).isExhausted()) {
            notificationService.notifyTrainingContractExceeded(training);
        }

        bookingRequest
                .setStatus(BookingRequestStatus.APPROVED)
                .setTrainerComment(normalizeNullableText(trainerComment))
                .setReviewedAt(LocalDateTime.now());

        BookingRequest saved = bookingRequestRepository.save(bookingRequest);
        notificationService.notifyBookingRequestApproved(saved);

        return toResponse(saved);
    }

    public BookingRequestResponse declineForCurrentTrainer(Long requestId, String trainerComment) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        BookingRequest bookingRequest = bookingRequestRepository.findByIdAndTrainerId(requestId, trainer.getId())
                .orElseThrow(() -> new ApiException("BOOKING_REQUEST_NOT_FOUND", "Запрос на запись не найден"));

        if (bookingRequest.getStatus() != BookingRequestStatus.PENDING) {
            throw new ApiException("BOOKING_REQUEST_ALREADY_REVIEWED", "Запрос уже обработан");
        }

        bookingRequest
                .setStatus(BookingRequestStatus.DECLINED)
                .setTrainerComment(normalizeNullableText(trainerComment))
                .setReviewedAt(LocalDateTime.now());

        BookingRequest saved = bookingRequestRepository.save(bookingRequest);
        notificationService.notifyBookingRequestDeclined(saved);

        return toResponse(saved);
    }

    public BookingRequestResponse cancelForCurrentClient(Long id) {
        AppUser client = getCurrentClient();

        BookingRequest bookingRequest = bookingRequestRepository.findByIdAndClientId(id, client.getId())
                .orElseThrow(() -> new ApiException("BOOKING_REQUEST_NOT_FOUND", "Запрос не найден"));

        if (bookingRequest.getStatus() != BookingRequestStatus.PENDING) {
            throw new ApiException(
                    "BOOKING_REQUEST_CANNOT_BE_CANCELLED",
                    "Отменить можно только запрос в статусе ожидания"
            );
        }

        bookingRequest.setStatus(BookingRequestStatus.CANCELLED);
        bookingRequest.setReviewedAt(LocalDateTime.now());

        BookingRequest saved = bookingRequestRepository.save(bookingRequest);
        return toResponse(saved);
    }

    private BookingRequestResponse toResponse(BookingRequest bookingRequest) {
        Training original = bookingRequest.getOriginalTraining();
        return new BookingRequestResponse()
                .setId(bookingRequest.getId())
                .setTrainerId(bookingRequest.getTrainer().getId())
                .setTrainerEmail(bookingRequest.getTrainer().getEmail())
                .setTrainerFirstName(bookingRequest.getTrainer().getFirstName())
                .setTrainerLastName(bookingRequest.getTrainer().getLastName())
                .setClientId(bookingRequest.getClient().getId())
                .setClientEmail(bookingRequest.getClient().getEmail())
                .setClientFirstName(bookingRequest.getClient().getFirstName())
                .setClientLastName(bookingRequest.getClient().getLastName())
                .setOriginalTrainingId(original != null ? original.getId() : null)
                .setOriginalTrainingDate(original != null ? original.getTrainingDate() : null)
                .setOriginalStartTime(original != null ? original.getStartTime() : null)
                .setOriginalEndTime(original != null ? original.getEndTime() : null)
                .setRequestedStart(bookingRequest.getRequestedStart())
                .setRequestedEnd(bookingRequest.getRequestedEnd())
                .setStatus(bookingRequest.getStatus().name())
                .setClientComment(bookingRequest.getClientComment())
                .setTrainerComment(bookingRequest.getTrainerComment())
                .setReviewedAt(bookingRequest.getReviewedAt())
                .setCreatedAt(bookingRequest.getCreatedAt())
                .setUpdatedAt(bookingRequest.getUpdatedAt());
    }

    /**
     * Validates the training a reschedule request points at: it must belong to
     * this client and trainer, still be planned, and have no other pending
     * reschedule.
     */
    private Training resolveOriginalTraining(Long originalTrainingId, AppUser client, AppUser trainer) {
        if (originalTrainingId == null) {
            return null;
        }

        Training training = trainingRepository.findById(originalTrainingId)
                .orElseThrow(() -> new ApiException("TRAINING_NOT_FOUND", "Тренировка не найдена"));

        if (!training.getClient().getId().equals(client.getId())
                || !training.getTrainer().getId().equals(trainer.getId())) {
            throw new ApiException("TRAINING_NOT_FOUND", "Тренировка не найдена");
        }
        if (training.getStatus() != TrainingStatus.PLANNED) {
            throw new ApiException("TRAINING_NOT_PLANNED", "Перенести можно только запланированную тренировку");
        }
        if (bookingRequestRepository.existsByOriginalTrainingIdAndStatus(training.getId(), BookingRequestStatus.PENDING)) {
            throw new ApiException("RESCHEDULE_ALREADY_REQUESTED", "Запрос на перенос этой тренировки уже отправлен");
        }

        return training;
    }

    private AppUser getCurrentClient() {
        AppUser currentUser = currentUserService.getCurrentUser();
        if (currentUser.getRole() != UserRole.CLIENT) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только клиенту");
        }
        return currentUser;
    }

    private String normalizeNullableText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
