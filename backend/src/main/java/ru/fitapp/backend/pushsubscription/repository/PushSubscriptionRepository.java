package ru.fitapp.backend.pushsubscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.pushsubscription.entity.PushSubscription;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {

    List<PushSubscription> findAllByUserId(Long userId);

    Optional<PushSubscription> findByUserIdAndEndpoint(Long userId, String endpoint);

    void deleteByEndpoint(String endpoint);
}
