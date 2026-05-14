package ru.fitapp.backend.legal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserConsentRepository extends JpaRepository<UserConsent, Long> {

    List<UserConsent> findByUserIdAndRevokedAtIsNull(Long userId);
}