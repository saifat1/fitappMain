package ru.fitapp.backend.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.fitapp.backend.subscription.entity.TrainerSubscription;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TrainerSubscriptionRepository extends JpaRepository<TrainerSubscription, Long> {

    Optional<TrainerSubscription> findByTrainerId(Long trainerId);

    /** Subscriptions whose paid period ended and that are still inside the grace window — renewal candidates. */
    @Query("""
            select s
            from TrainerSubscription s
            where s.autoRenew = true
              and s.paymentMethodToken is not null
              and s.paidUntil is not null
              and s.paidUntil <= :now
              and s.paidUntil > :graceStart
            """)
    List<TrainerSubscription> findDueForRenewal(LocalDateTime now, LocalDateTime graceStart);
}
