package ru.fitapp.backend.trainingexercise.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.trainingexercise.entity.TrainingExercise;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TrainingExerciseRepository extends JpaRepository<TrainingExercise, Long> {

    List<TrainingExercise> findAllByTrainingIdOrderByOrderNumAsc(Long trainingId);

    List<TrainingExercise> findAllByTrainingIdInOrderByTrainingIdAscOrderNumAsc(
            Collection<Long> trainingIds
    );

    Optional<TrainingExercise> findByIdAndTrainingId(Long id, Long trainingId);

    long countByTrainingId(Long trainingId);

    /** FIT-76: exercises (with sets) of the client's completed trainings, with any trainer or on their own. */
    @Query("""
            select distinct te from TrainingExercise te
            join fetch te.training t
            left join fetch te.setDetails
            where t.client.id = :clientId
              and t.status = :status
            """)
    List<TrainingExercise> findAllForProgress(
            @Param("clientId") Long clientId,
            @Param("status") TrainingStatus status
    );

    Optional<TrainingExercise> findTopByTrainingIdOrderByOrderNumDesc(Long trainingId);
}