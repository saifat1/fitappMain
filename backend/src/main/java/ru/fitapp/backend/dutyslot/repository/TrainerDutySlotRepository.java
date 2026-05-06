package ru.fitapp.backend.dutyslot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.dutyslot.entity.TrainerDutySlot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface TrainerDutySlotRepository extends JpaRepository<TrainerDutySlot, Long> {

    List<TrainerDutySlot> findAllByTrainerIdAndDutyDateBetweenOrderByDutyDateAscStartTimeAsc(
            Long trainerId,
            LocalDate from,
            LocalDate to
    );

    boolean existsByTrainerIdAndDutyDateAndStartTime(
            Long trainerId,
            LocalDate dutyDate,
            LocalTime startTime
    );

    Optional<TrainerDutySlot> findByIdAndTrainerId(Long id, Long trainerId);
}