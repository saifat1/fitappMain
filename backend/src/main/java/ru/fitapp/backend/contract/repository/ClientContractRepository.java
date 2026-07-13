package ru.fitapp.backend.contract.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.fitapp.backend.contract.entity.ClientContract;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ClientContractRepository extends JpaRepository<ClientContract, Long> {

    List<ClientContract> findAllByClientIdAndTrainerIdOrderByCreatedAtDesc(Long clientId, Long trainerId);

    Optional<ClientContract> findFirstByClientIdAndTrainerIdAndRemainingTrainingsGreaterThanOrderByCreatedAtAsc(
            Long clientId,
            Long trainerId,
            int remainingTrainingsThreshold
    );

    boolean existsByClientIdAndTrainerId(Long clientId, Long trainerId);

    @Query("select coalesce(sum(c.remainingTrainings), 0) from ClientContract c "
            + "where c.client.id = :clientId and c.trainer.id = :trainerId")
    int sumRemainingTrainings(@Param("clientId") Long clientId, @Param("trainerId") Long trainerId);

    @Query("select coalesce(sum(c.totalTrainings), 0) from ClientContract c "
            + "where c.client.id = :clientId and c.trainer.id = :trainerId")
    int sumTotalTrainings(@Param("clientId") Long clientId, @Param("trainerId") Long trainerId);

    /**
     * Contracts whose end date falls within the next `daysAhead` days (and
     * hasn't already passed) that haven't triggered the heads-up notification
     * yet. Bounded by a window rather than an exact "today + 10" match so a
     * missed/delayed job run still catches them before the date passes.
     */
    List<ClientContract> findAllByEndDateIsNotNullAndEndDateBetweenAndExpiryNotifiedFalse(
            LocalDate from,
            LocalDate to
    );
}
