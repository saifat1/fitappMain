package ru.fitapp.backend.user.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.user.model.UserStatus;
import ru.fitapp.backend.user.repository.UserRepository;

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

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(normalizeEmail(email));
    }

    public AppUser createClient(String email,
                                String passwordHash,
                                String firstName,
                                String lastName) {

        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException("EMAIL_ALREADY_EXISTS", "Пользователь с таким email уже существует");
        }

        AppUser user = new AppUser()
                .setEmail(normalizedEmail)
                .setPasswordHash(passwordHash)
                .setRole(UserRole.CLIENT)
                .setStatus(UserStatus.ACTIVE)
                .setFirstName(firstName)
                .setLastName(lastName);

        return userRepository.save(user);
    }

    public AppUser createTrainer(String email,
                                 String passwordHash,
                                 String firstName,
                                 String lastName) {

        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ApiException("EMAIL_ALREADY_EXISTS", "Пользователь с таким email уже существует");
        }

        AppUser user = new AppUser()
                .setEmail(normalizedEmail)
                .setPasswordHash(passwordHash)
                .setRole(UserRole.TRAINER)
                .setStatus(UserStatus.ACTIVE)
                .setFirstName(firstName)
                .setLastName(lastName);

        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Email не должен быть пустым");
        }
        return email.trim().toLowerCase();
    }
}