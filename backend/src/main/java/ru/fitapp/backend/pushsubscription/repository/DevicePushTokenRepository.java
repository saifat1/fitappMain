package ru.fitapp.backend.pushsubscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.pushsubscription.entity.DevicePushToken;

import java.util.List;
import java.util.Optional;

public interface DevicePushTokenRepository extends JpaRepository<DevicePushToken, Long> {

    List<DevicePushToken> findAllByUserId(Long userId);

    boolean existsByUserId(Long userId);

    Optional<DevicePushToken> findByToken(String token);

    void deleteByToken(String token);
}
