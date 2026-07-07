package ru.fitapp.backend.contract.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.fitapp.backend.contract.entity.ClientContract;

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
}
