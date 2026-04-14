package ru.fitapp.backend.invite.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.invite.entity.Invite;

import java.util.List;
import java.util.Optional;

public interface InviteRepository extends JpaRepository<Invite, Long> {

    Optional<Invite> findByToken(String token);

    boolean existsByToken(String token);

    List<Invite> findAllByTrainerIdOrderByCreatedAtDesc(Long trainerId);

    Optional<Invite> findByIdAndTrainerId(Long id, Long trainerId);
}