package ru.fitapp.backend.availability.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.fitapp.backend.availability.entity.TrainerAvailabilityException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TrainerAvailabilityExceptionRepository extends JpaRepository<TrainerAvailabilityException, Long> {

    List<TrainerAvailabilityException> findAllByTrainerIdOrderByExceptionDateAscStartTimeAsc(Long trainerId);

    /** Exceptions whose [exceptionDate, endDate] range intersects [from, to] (multi-day closures included). */
    @Query("""
            select e from TrainerAvailabilityException e
            where e.trainer.id = :trainerId
              and e.exceptionDate <= :to
              and coalesce(e.endDate, e.exceptionDate) >= :from
            order by e.exceptionDate asc, e.startTime asc
            """)
    List<TrainerAvailabilityException> findOverlapping(
            @Param("trainerId") Long trainerId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    Optional<TrainerAvailabilityException> findByIdAndTrainerId(Long id, Long trainerId);

    void deleteAllByTrainerId(Long trainerId);
}