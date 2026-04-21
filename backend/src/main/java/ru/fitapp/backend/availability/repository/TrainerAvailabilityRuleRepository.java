package ru.fitapp.backend.availability.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.availability.entity.TrainerAvailabilityRule;

import java.util.List;

public interface TrainerAvailabilityRuleRepository extends JpaRepository<TrainerAvailabilityRule, Long> {

    List<TrainerAvailabilityRule> findAllByTrainerIdOrderByDayOfWeekAscStartTimeAsc(Long trainerId);

    List<TrainerAvailabilityRule> findAllByTrainerIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(Long trainerId);

    void deleteAllByTrainerId(Long trainerId);
}
