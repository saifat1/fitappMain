package ru.fitapp.backend.trainingexercise.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.trainingexercise.entity.TrainingExercise;

import java.util.List;
import java.util.Optional;

public interface TrainingExerciseRepository extends JpaRepository<TrainingExercise, Long> {

    List<TrainingExercise> findAllByTrainingIdOrderByOrderNumAsc(Long trainingId);

    Optional<TrainingExercise> findByIdAndTrainingId(Long id, Long trainingId);

    long countByTrainingId(Long trainingId);
}