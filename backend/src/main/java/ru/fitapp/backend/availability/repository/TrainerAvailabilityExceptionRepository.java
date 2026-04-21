package ru.fitapp.backend.availability.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.availability.entity.TrainerAvailabilityException;

import java.time.LocalDate;
import java.util.List;

public interface TrainerAvailabilityExceptionRepository extends JpaRepository<TrainerAvailabilityException, Long> {

    List<TrainerAvailabilityException> findAllByTrainerIdOrderByExceptionDateAscStartTimeAsc(Long trainerId);

    List<TrainerAvailabilityException> findAllByTrainerIdAndExceptionDateBetweenOrderByExceptionDateAscStartTimeAsc(
            Long trainerId,
            LocalDate from,
            LocalDate to
    );

    void deleteAllByTrainerId(Long trainerId);
}