package ru.fitapp.backend.reschedule.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.notification.service.NotificationService;
import ru.fitapp.backend.reschedule.dto.CreateRescheduleRequestRequest;
import ru.fitapp.backend.reschedule.dto.ProcessRescheduleRequestRequest;
import ru.fitapp.backend.reschedule.dto.RescheduleRequestResponse;
import ru.fitapp.backend.reschedule.entity.RescheduleRequest;
import ru.fitapp.backend.reschedule.model.RescheduleRequestStatus;
import ru.fitapp.backend.reschedule.repository.RescheduleRequestRepository;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.training.service.TrainingService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class RescheduleRequestService {

    private final RescheduleRequestRepository rescheduleRequestRepository;
    private final TrainingService trainingService;
    private final TrainingRepository trainingRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public RescheduleRequestService(RescheduleRequestRepository rescheduleRequestRepository,
                                    TrainingService trainingService,
                                    TrainingRepository trainingRepository,
                                    CurrentUserService currentUserService,
                                    NotificationService notificationService) {
        this.rescheduleRequestRepository = rescheduleRequestRepository;
        this.trainingService = trainingService;
        this.trainingRepository = trainingRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    public RescheduleRequestResponse createRequest(Long trainingId,
                                                   CreateRescheduleRequestRequest request) {
        AppUser requester = currentUserService.getCurrentUser();

        if (requester.getRole() != UserRole.CLIENT) {
            throw new ApiException("ACCESS_DENIED", "Запрос на перенос может создать только клиент");
        }

        Training training = trainingService.getClientOwnedTrainingEntity(trainingId);

        if (training.getStatus() == TrainingStatus.CANCELLED) {
            throw new ApiException("TRAINING_ALREADY_CANCELLED", "Нельзя перенести отменённую тренировку");
        }

        if (training.getStatus() == TrainingStatus.COMPLETED) {
            throw new ApiException("TRAINING_ALREADY_COMPLETED", "Нельзя запросить перенос завершённой тренировки");
        }

        validateTimeRange(request.getRequestedStartTime(), request.getRequestedEndTime());

        boolean hasPending = rescheduleRequestRepository.existsByTrainingIdAndStatus(
                trainingId,
                RescheduleRequestStatus.PENDING
        );

        if (hasPending) {
            throw new ApiException("RESCHEDULE_REQUEST_ALREADY_EXISTS", "По этой тренировке уже есть активный запрос на перенос");
        }

        RescheduleRequest entity = new RescheduleRequest()
                .setTraining(training)
                .setRequester(requester)
                .setRequestedTrainingDate(request.getRequestedTrainingDate())
                .setRequestedStartTime(request.getRequestedStartTime())
                .setRequestedEndTime(request.getRequestedEndTime())
                .setClientComment(normalizeOptional(request.getClientComment()))
                .setStatus(RescheduleRequestStatus.PENDING);

        RescheduleRequest saved = rescheduleRequestRepository.save(entity);
        notificationService.notifyRescheduleRequestCreated(saved);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RescheduleRequestResponse> getCurrentUserRequests() {
        AppUser currentUser = currentUserService.getCurrentUser();

        if (currentUser.getRole() == UserRole.TRAINER) {
            return rescheduleRequestRepository.findAllByTrainingTrainerIdOrderByCreatedAtDesc(currentUser.getId())
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        if (currentUser.getRole() == UserRole.CLIENT) {
            return rescheduleRequestRepository.findAllByTrainingClientIdOrderByCreatedAtDesc(currentUser.getId())
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }

        throw new ApiException("ACCESS_DENIED", "Недостаточно прав для просмотра запросов");
    }

    @Transactional(readOnly = true)
    public RescheduleRequestResponse getRequest(Long requestId) {
        AppUser currentUser = currentUserService.getCurrentUser();
        RescheduleRequest request = getAccessibleRequestOrThrow(requestId, currentUser);

        return mapToResponse(request);
    }

    public RescheduleRequestResponse processRequest(Long requestId,
                                                    ProcessRescheduleRequestRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        RescheduleRequest entity = rescheduleRequestRepository.findByIdAndTrainingTrainerId(requestId, trainer.getId())
                .orElseThrow(() -> new ApiException("RESCHEDULE_REQUEST_NOT_FOUND", "Запрос на перенос не найден"));

        if (entity.getStatus() != RescheduleRequestStatus.PENDING) {
            throw new ApiException("RESCHEDULE_REQUEST_ALREADY_PROCESSED", "Запрос уже обработан");
        }

        RescheduleRequestStatus decision = parseDecision(request.getDecision());

        if (decision != RescheduleRequestStatus.APPROVED && decision != RescheduleRequestStatus.REJECTED) {
            throw new ApiException("INVALID_RESCHEDULE_DECISION", "Допустимы только решения APPROVED или REJECTED");
        }

        entity.setTrainerComment(normalizeOptional(request.getTrainerComment()));
        entity.setStatus(decision);
        entity.setProcessedAt(LocalDateTime.now());

        if (decision == RescheduleRequestStatus.APPROVED) {
            Training training = entity.getTraining();

            training.setTrainingDate(entity.getRequestedTrainingDate());
            training.setStartTime(entity.getRequestedStartTime());
            training.setEndTime(entity.getRequestedEndTime());

            trainingRepository.save(training);
        }

        RescheduleRequest saved = rescheduleRequestRepository.save(entity);

        if (decision == RescheduleRequestStatus.APPROVED) {
            notificationService.notifyRescheduleRequestApproved(saved);
        } else {
            notificationService.notifyRescheduleRequestRejected(saved);
        }

        return mapToResponse(saved);
    }

    public void cancelOwnRequest(Long requestId) {
        AppUser client = currentUserService.getCurrentUser();

        if (client.getRole() != UserRole.CLIENT) {
            throw new ApiException("ACCESS_DENIED", "Только клиент может отменить свой запрос");
        }

        RescheduleRequest entity = rescheduleRequestRepository.findByIdAndTrainingClientId(requestId, client.getId())
                .orElseThrow(() -> new ApiException("RESCHEDULE_REQUEST_NOT_FOUND", "Запрос на перенос не найден"));

        if (!entity.getRequester().getId().equals(client.getId())) {
            throw new ApiException("ACCESS_DENIED", "Можно отменить только свой запрос");
        }

        if (entity.getStatus() != RescheduleRequestStatus.PENDING) {
            throw new ApiException("RESCHEDULE_REQUEST_ALREADY_PROCESSED", "Запрос уже обработан");
        }

        entity.setStatus(RescheduleRequestStatus.CANCELLED);
        entity.setProcessedAt(LocalDateTime.now());

        rescheduleRequestRepository.save(entity);
    }

    private RescheduleRequest getAccessibleRequestOrThrow(Long requestId, AppUser currentUser) {
        if (currentUser.getRole() == UserRole.TRAINER) {
            return rescheduleRequestRepository.findByIdAndTrainingTrainerId(requestId, currentUser.getId())
                    .orElseThrow(() -> new ApiException("RESCHEDULE_REQUEST_NOT_FOUND", "Запрос на перенос не найден"));
        }

        if (currentUser.getRole() == UserRole.CLIENT) {
            return rescheduleRequestRepository.findByIdAndTrainingClientId(requestId, currentUser.getId())
                    .orElseThrow(() -> new ApiException("RESCHEDULE_REQUEST_NOT_FOUND", "Запрос на перенос не найден"));
        }

        throw new ApiException("ACCESS_DENIED", "Недостаточно прав");
    }

    private RescheduleRequestStatus parseDecision(String value) {
        try {
            return RescheduleRequestStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException("INVALID_RESCHEDULE_DECISION", "Некорректное решение по запросу");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime != null && endTime != null && endTime.isBefore(startTime)) {
            throw new ApiException("INVALID_TRAINING_TIME", "Время окончания не может быть раньше времени начала");
        }
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private RescheduleRequestResponse mapToResponse(RescheduleRequest entity) {
        return new RescheduleRequestResponse()
                .setId(entity.getId())
                .setTrainingId(entity.getTraining().getId())
                .setRequesterId(entity.getRequester().getId())
                .setRequesterEmail(entity.getRequester().getEmail())
                .setRequestedTrainingDate(entity.getRequestedTrainingDate())
                .setRequestedStartTime(entity.getRequestedStartTime())
                .setRequestedEndTime(entity.getRequestedEndTime())
                .setClientComment(entity.getClientComment())
                .setTrainerComment(entity.getTrainerComment())
                .setStatus(entity.getStatus().name())
                .setProcessedAt(entity.getProcessedAt())
                .setCreatedAt(entity.getCreatedAt())
                .setUpdatedAt(entity.getUpdatedAt());
    }
}