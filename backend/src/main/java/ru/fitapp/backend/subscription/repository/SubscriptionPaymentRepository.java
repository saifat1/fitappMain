package ru.fitapp.backend.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.subscription.entity.SubscriptionPayment;

import java.util.List;
import java.util.Optional;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, Long> {

    List<SubscriptionPayment> findTop20ByTrainerIdOrderByCreatedAtDesc(Long trainerId);

    Optional<SubscriptionPayment> findByProviderAndProviderPaymentId(String provider, String providerPaymentId);

    Optional<SubscriptionPayment> findByIdAndTrainerId(Long id, Long trainerId);
}
