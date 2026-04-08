package ru.fitapp.backend.trainerclient.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.trainerclient.entity.TrainerClient;

import java.util.List;
import java.util.Optional;

public interface TrainerClientRepository extends JpaRepository<TrainerClient, Long> {

    List<TrainerClient> findAllByTrainerId(Long trainerId);

    Optional<TrainerClient> findByTrainerIdAndClientId(Long trainerId, Long clientId);

    boolean existsByTrainerIdAndClientId(Long trainerId, Long clientId);
}