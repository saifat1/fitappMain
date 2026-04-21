package ru.fitapp.backend.trainerclient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.fitapp.backend.trainerclient.entity.TrainerClient;

import java.util.List;
import java.util.Optional;

public interface TrainerClientRepository extends JpaRepository<TrainerClient, Long> {

    List<TrainerClient> findAllByTrainerId(Long trainerId);

    @Query("""
            select tc
            from TrainerClient tc
            join fetch tc.trainer t
            where tc.client.id = :clientId
            order by tc.id asc
            """)
    List<TrainerClient> findAllByClientIdWithTrainer(Long clientId);

    Optional<TrainerClient> findByTrainerIdAndClientId(Long trainerId, Long clientId);

    boolean existsByTrainerIdAndClientId(Long trainerId, Long clientId);
}