package ru.fitapp.backend.bookingrequest.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.bookingrequest.entity.BookingRequest;
import ru.fitapp.backend.bookingrequest.model.BookingRequestStatus;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRequestRepository extends JpaRepository<BookingRequest, Long> {

    List<BookingRequest> findAllByClientIdOrderByCreatedAtDesc(Long clientId);

    List<BookingRequest> findAllByTrainerIdOrderByCreatedAtDesc(Long trainerId);

    Optional<BookingRequest> findByIdAndTrainerId(Long id, Long trainerId);

    boolean existsByTrainerIdAndClientIdAndRequestedStartAndRequestedEndAndStatus(
            Long trainerId,
            Long clientId,
            LocalDateTime requestedStart,
            LocalDateTime requestedEnd,
            BookingRequestStatus status
    );

    boolean existsByClientIdAndTrainerIdAndRequestedStartAndRequestedEndAndStatusIn(
            Long clientId,
            Long trainerId,
            LocalDateTime requestedStart,
            LocalDateTime requestedEnd,
            Collection<BookingRequestStatus> statuses
    );

    Optional<BookingRequest> findByIdAndClientId(Long id, Long clientId);
}
