package ru.fitapp.backend.dutyslot.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.dutyslot.dto.CreateTrainerDutySlotRequest;
import ru.fitapp.backend.dutyslot.dto.TrainerDutySlotResponse;
import ru.fitapp.backend.dutyslot.entity.TrainerDutySlot;
import ru.fitapp.backend.dutyslot.repository.TrainerDutySlotRepository;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class TrainerDutySlotService {

    private static final long DUTY_SLOT_DURATION_MINUTES = 60;
    private static final long MAX_RANGE_DAYS = 62;

    private final TrainerDutySlotRepository trainerDutySlotRepository;
    private final CurrentUserService currentUserService;

    public TrainerDutySlotService(
            TrainerDutySlotRepository trainerDutySlotRepository,
            CurrentUserService currentUserService
    ) {
        this.trainerDutySlotRepository = trainerDutySlotRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<TrainerDutySlotResponse> getMyDutySlots(LocalDate from, LocalDate to) {
        validateRange(from, to);

        AppUser trainer = currentUserService.getCurrentTrainer();

        return trainerDutySlotRepository
                .findAllByTrainerIdAndDutyDateBetweenOrderByDutyDateAscStartTimeAsc(
                        trainer.getId(),
                        from,
                        to
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TrainerDutySlotResponse createMyDutySlot(CreateTrainerDutySlotRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        validateDutySlot(request.getDutyDate(), request.getStartTime(), request.getEndTime());

        boolean exists = trainerDutySlotRepository.existsByTrainerIdAndDutyDateAndStartTime(
                trainer.getId(),
                request.getDutyDate(),
                request.getStartTime()
        );

        if (exists) {
            throw new ApiException(
                    "DUTY_SLOT_ALREADY_EXISTS",
                    "Такой дежурный слот уже существует"
            );
        }

        TrainerDutySlot saved = trainerDutySlotRepository.save(
                new TrainerDutySlot()
                        .setTrainer(trainer)
                        .setDutyDate(request.getDutyDate())
                        .setStartTime(request.getStartTime())
                        .setEndTime(request.getEndTime())
        );

        return toResponse(saved);
    }

    public void deleteMyDutySlot(Long id) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        TrainerDutySlot dutySlot = trainerDutySlotRepository
                .findByIdAndTrainerId(id, trainer.getId())
                .orElseThrow(() -> new ApiException("DUTY_SLOT_NOT_FOUND", "Дежурный слот не найден"));

        trainerDutySlotRepository.delete(dutySlot);
    }

    private void validateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new ApiException("VALIDATION_ERROR", "Период from/to обязателен");
        }

        if (to.isBefore(from)) {
            throw new ApiException("VALIDATION_ERROR", "Дата to не может быть раньше from");
        }

        if (from.plusDays(MAX_RANGE_DAYS).isBefore(to)) {
            throw new ApiException("VALIDATION_ERROR", "Слишком большой диапазон дат");
        }
    }

    private void validateDutySlot(LocalDate dutyDate, LocalTime startTime, LocalTime endTime) {
        if (dutyDate == null) {
            throw new ApiException("VALIDATION_ERROR", "Дата дежурства обязательна");
        }

        if (startTime == null || endTime == null) {
            throw new ApiException("VALIDATION_ERROR", "Время начала и окончания обязательно");
        }

        if (!endTime.isAfter(startTime)) {
            throw new ApiException(
                    "INVALID_TIME_RANGE",
                    "Время окончания должно быть позже времени начала"
            );
        }

        long durationMinutes = Duration.between(startTime, endTime).toMinutes();

        if (durationMinutes != DUTY_SLOT_DURATION_MINUTES) {
            throw new ApiException(
                    "DUTY_SLOT_MUST_BE_ONE_HOUR",
                    "Дежурный слот должен быть ровно 1 час"
            );
        }

        if (startTime.getMinute() != 0 || endTime.getMinute() != 0) {
            throw new ApiException(
                    "DUTY_SLOT_MUST_BE_HOUR_ALIGNED",
                    "Дежурный слот должен начинаться и заканчиваться ровно в час"
            );
        }
    }

    private TrainerDutySlotResponse toResponse(TrainerDutySlot slot) {
        return new TrainerDutySlotResponse()
                .setId(slot.getId())
                .setDutyDate(slot.getDutyDate())
                .setStartTime(slot.getStartTime())
                .setEndTime(slot.getEndTime());
    }
}