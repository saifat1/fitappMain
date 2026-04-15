package ru.fitapp.backend.training.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.training.dto.CreateTrainingRequest;
import ru.fitapp.backend.training.dto.TrainingResponse;
import ru.fitapp.backend.training.dto.UpdateTrainingRequest;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class TrainingService {

    private final TrainingRepository trainingRepository;
    private final CurrentUserService currentUserService;
    private final TrainerClientService trainerClientService;

    public TrainingService(TrainingRepository trainingRepository,
                           CurrentUserService currentUserService,
                           TrainerClientService trainerClientService) {
        this.trainingRepository = trainingRepository;
        this.currentUserService = currentUserService;
        this.trainerClientService = trainerClientService;
    }

    public TrainingResponse createTraining(CreateTrainingRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        validateTimeRange(request.getStartTime(), request.getEndTime());

        AppUser client = trainerClientService.getClientOfTrainer(trainer.getId(), request.getClientId());

        Training training = new Training()
                .setTrainer(trainer)
                .setClient(client)
                .setTrainingDate(request.getTrainingDate())
                .setStartTime(request.getStartTime())
                .setEndTime(request.getEndTime())
                .setStatus(TrainingStatus.PLANNED)
                .setTrainerNote(normalizeNote(request.getTrainerNote()));

        Training saved = trainingRepository.save(training);
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
                    .map(this::mapToResponse)
                    .toList();
        }

        throw new ApiException("ACCESS_DENIED", "Недостаточно прав для просмотра тренировок");
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

        Training saved = trainingRepository.save(training);
        return mapToResponse(saved);
    }

    public void cancelTraining(Long trainingId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        Training training = getTrainerOwnedTrainingOrThrow(trainingId, trainer.getId());

        training.setStatus(TrainingStatus.CANCELLED);
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
                .setTrainerNote(training.getTrainerNote())
                .setClientNote(training.getClientNote())
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

    private void validateDate(LocalDate date) {
        if (date == null) {
            throw new ApiException("VALIDATION_ERROR", "Дата обязательна");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime != null && endTime != null && endTime.isBefore(startTime)) {
            throw new ApiException("INVALID_TRAINING_TIME", "Время окончания не может быть раньше времени начала");
        }
    }

    private TrainingStatus parseStatus(String status) {
        try {
            return TrainingStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException("INVALID_TRAINING_STATUS", "Некорректный статус тренировки");
        }
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

        Training saved = trainingRepository.save(training);
        return mapToResponse(saved);
    }

}