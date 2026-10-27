package ru.fitapp.backend.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.subscription.entity.SubscriptionConsent;

public interface SubscriptionConsentRepository extends JpaRepository<SubscriptionConsent, Long> {
}
