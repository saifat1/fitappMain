package ru.fitapp.backend.exercisetemplate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.exercisetemplate.entity.ExerciseTemplate;

import java.util.List;
import java.util.Optional;

public interface ExerciseTemplateRepository extends JpaRepository<ExerciseTemplate, Long> {

    List<ExerciseTemplate> findAllByTrainerIdAndIsArchivedOrderByNameAsc(Long trainerId, Boolean isArchived);

    List<ExerciseTemplate> findAllByTrainerIdOrderByNameAsc(Long trainerId);

    Optional<ExerciseTemplate> findByIdAndTrainerId(Long id, Long trainerId);
}