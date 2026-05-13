package ru.fitapp.backend.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.user.model.UserStatus;
import ru.fitapp.backend.user.repository.UserRepository;
import java.time.LocalDateTime;

import java.time.LocalDateTime;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AppUser getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("USER_NOT_FOUND", "Пользователь не найден"));
    }

    @Transactional(readOnly = true)
    public AppUser getByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ApiException("USER_NOT_FOUND", "Пользователь не найден"));
    }

    public AppUser markLoginSuccess(AppUser user) {
        LocalDateTime now = LocalDateTime.now();

        user.setLastLoginAt(now);
        user.setLastSeenAt(now);
        user.setLoginCount(user.getLoginCount() == null ? 1L : user.getLoginCount() + 1);

        return userRepository.save(user);
    }

    public AppUser markSeen(AppUser user) {
        user.setLastSeenAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(normalizeEmail(email));
    }

    public AppUser createClient(String email, String passwordHash, String firstName, String lastName) {
        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException("EMAIL_ALREADY_EXISTS", "Пользователь с таким email уже существует");
        }

        AppUser user = new AppUser()
                .setEmail(normalizedEmail)
                .setPasswordHash(passwordHash)
                .setRole(UserRole.CLIENT)
                .setStatus(UserStatus.ACTIVE)
                .setFirstName(normalizeOptionalName(firstName))
                .setLastName(normalizeOptionalName(lastName))
                .setCreatedByTrainer(false)
                .setClaimedByClient(true)
                .setClaimedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public AppUser createClientCreatedByTrainer(
            String email,
            String technicalPasswordHash,
            String firstName,
            String lastName
    ) {
        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException("EMAIL_ALREADY_EXISTS", "Пользователь с таким email уже существует");
        }

        AppUser user = new AppUser()
                .setEmail(normalizedEmail)
                .setPasswordHash(technicalPasswordHash)
                .setRole(UserRole.CLIENT)
                .setStatus(UserStatus.ACTIVE)
                .setFirstName(normalizeOptionalName(firstName))
                .setLastName(normalizeOptionalName(lastName))
                .setCreatedByTrainer(true)
                .setClaimedByClient(false)
                .setClaimedAt(null);

        return userRepository.save(user);
    }

    public AppUser claimClientRegistration(
            AppUser client,
            String passwordHash,
            String firstName,
            String lastName
    ) {
        if (client == null || client.getId() == null || client.getRole() != UserRole.CLIENT) {
            throw new ApiException("CLIENT_NOT_FOUND", "Клиент не найден");
        }

        client.setPasswordHash(passwordHash);
        client.setFirstName(normalizeOptionalName(firstName));
        client.setLastName(normalizeOptionalName(lastName));
        client.setStatus(UserStatus.ACTIVE);
        client.setClaimedByClient(true);
        client.setClaimedAt(LocalDateTime.now());

        return userRepository.save(client);
    }

    public AppUser createTrainer(String email, String passwordHash, String firstName, String lastName) {
        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException("EMAIL_ALREADY_EXISTS", "Пользователь с таким email уже существует");
        }

        AppUser user = new AppUser()
                .setEmail(normalizedEmail)
                .setPasswordHash(passwordHash)
                .setRole(UserRole.TRAINER)
                .setStatus(UserStatus.ACTIVE)
                .setFirstName(normalizeOptionalName(firstName))
                .setLastName(normalizeOptionalName(lastName))
                .setCreatedByTrainer(false)
                .setClaimedByClient(false)
                .setClaimedAt(null);

        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Email не должен быть пустым");
        }
        return email.trim().toLowerCase();
    }

    private String normalizeOptionalName(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}