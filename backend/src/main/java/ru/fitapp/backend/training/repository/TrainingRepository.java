package ru.fitapp.backend.training.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.training.model.TrainingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import ru.fitapp.backend.training.model.TrainingStatus;

import java.time.LocalDate;
import java.time.LocalTime;
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

    List<Training> findAllByTrainerIdAndClientIdOrderByTrainingDateDescStartTimeDesc(
            Long trainerId,
            Long clientId
    );

    @Query("""
            select count(t)
            from Training t
            where t.trainer.id = :trainerId
              and t.trainingDate = :trainingDate
              and t.status = :status
              and t.startTime < :endTime
              and t.endTime > :startTime
            """)
    long countOverlappingTrainings(
            @Param("trainerId") Long trainerId,
            @Param("trainingDate") LocalDate trainingDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("status") TrainingStatus status
    );

    @EntityGraph(attributePaths = {"client"})
    List<Training> findAllByTrainerIdAndTrainingDateBetweenOrderByTrainingDateDescStartTimeDesc(
            Long trainerId,
            LocalDate from,
            LocalDate to
    );

    @EntityGraph(attributePaths = {"client"})
    List<Training> findAllByTrainerIdAndTrainingDateBetweenAndStatusOrderByTrainingDateAscStartTimeAsc(
            Long trainerId,
            LocalDate from,
            LocalDate to,
            TrainingStatus status
    );

    long countByStatus(TrainingStatus status);

}