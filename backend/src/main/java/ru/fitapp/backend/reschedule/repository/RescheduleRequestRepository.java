package ru.fitapp.backend.reschedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.reschedule.entity.RescheduleRequest;
import ru.fitapp.backend.reschedule.model.RescheduleRequestStatus;

import java.util.List;
import java.util.Optional;

public interface RescheduleRequestRepository extends JpaRepository<RescheduleRequest, Long> {

    List<RescheduleRequest> findAllByTrainingTrainerIdOrderByCreatedAtDesc(Long trainerId);

    List<RescheduleRequest> findAllByTrainingClientIdOrderByCreatedAtDesc(Long clientId);

    List<RescheduleRequest> findAllByTrainingTrainerIdAndStatusOrderByCreatedAtDesc(
            Long trainerId,
            RescheduleRequestStatus status
    );

    Optional<RescheduleRequest> findByIdAndTrainingTrainerId(Long id, Long trainerId);

    Optional<RescheduleRequest> findByIdAndTrainingClientId(Long id, Long clientId);

    boolean existsByTrainingIdAndStatus(Long trainingId, RescheduleRequestStatus status);
}