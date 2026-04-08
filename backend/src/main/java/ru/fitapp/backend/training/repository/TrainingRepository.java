package ru.fitapp.backend.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.training.entity.Training;

import java.time.LocalDate;
import java.util.List;

public interface TrainingRepository extends JpaRepository<Training, Long> {

    List<Training> findAllByTrainerIdAndTrainingDateBetweenOrderByTrainingDateAscStartTimeAsc(
            Long trainerId,
            LocalDate from,
            LocalDate to
    );

    List<Training> findAllByClientIdAndTrainingDateBetweenOrderByTrainingDateAscStartTimeAsc(
            Long clientId,
            LocalDate from,
            LocalDate to
    );
}