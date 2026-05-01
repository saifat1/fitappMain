package ru.fitapp.backend.trainer.profile.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.common.storage.LocalFileStorageService;
import ru.fitapp.backend.trainer.profile.dto.ChangeTrainerPasswordRequest;
import ru.fitapp.backend.trainer.profile.dto.TrainerProfileResponse;
import ru.fitapp.backend.trainer.profile.dto.UpdateTrainerProfileRequest;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.repository.UserRepository;

@Service
@Transactional
public class TrainerProfileService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LocalFileStorageService localFileStorageService;

    public TrainerProfileService(
            CurrentUserService currentUserService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            LocalFileStorageService localFileStorageService
    ) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.localFileStorageService = localFileStorageService;
    }

    @Transactional(readOnly = true)
    public TrainerProfileResponse getCurrentProfile() {
        AppUser trainer = currentUserService.getCurrentTrainer();
        return mapToResponse(trainer);
    }

    public TrainerProfileResponse updateCurrentProfile(UpdateTrainerProfileRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        trainer.setFirstName(normalizeOptional(request.getFirstName()));
        trainer.setLastName(normalizeOptional(request.getLastName()));
        trainer.setPhone(normalizeOptional(request.getPhone()));

        AppUser saved = userRepository.save(trainer);
        return mapToResponse(saved);
    }

    public void changeCurrentPassword(ChangeTrainerPasswordRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        if (!passwordEncoder.matches(request.getCurrentPassword(), trainer.getPasswordHash())) {
            throw new ApiException("INVALID_CURRENT_PASSWORD", "Текущий пароль указан неверно");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ApiException("PASSWORD_CONFIRMATION_MISMATCH", "Подтверждение нового пароля не совпадает");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new ApiException("PASSWORD_NOT_CHANGED", "Новый пароль должен отличаться от текущего");
        }

        trainer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(trainer);
    }

    public TrainerProfileResponse uploadCurrentAvatar(MultipartFile file) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        String oldAvatarPath = trainer.getAvatarPath();
        String newAvatarPath = localFileStorageService.storeAvatar(file);

        try {
            trainer.setAvatarPath(newAvatarPath);
            AppUser saved = userRepository.save(trainer);

            if (oldAvatarPath != null && !oldAvatarPath.isBlank() && !oldAvatarPath.equals(newAvatarPath)) {
                localFileStorageService.deleteByPublicPath(oldAvatarPath);
            }

            return mapToResponse(saved);
        } catch (RuntimeException ex) {
            localFileStorageService.deleteByPublicPath(newAvatarPath);
            throw ex;
        }
    }

    public TrainerProfileResponse deleteCurrentAvatar() {
        AppUser trainer = currentUserService.getCurrentTrainer();

        String oldAvatarPath = trainer.getAvatarPath();
        trainer.setAvatarPath(null);

        AppUser saved = userRepository.save(trainer);

        if (oldAvatarPath != null && !oldAvatarPath.isBlank()) {
            localFileStorageService.deleteByPublicPath(oldAvatarPath);
        }

        return mapToResponse(saved);
    }

    private TrainerProfileResponse mapToResponse(AppUser trainer) {
        return new TrainerProfileResponse()
                .setId(trainer.getId())
                .setEmail(trainer.getEmail())
                .setFirstName(trainer.getFirstName())
                .setLastName(trainer.getLastName())
                .setPhone(trainer.getPhone())
                .setAvatarUrl(buildAvatarUrl(trainer.getAvatarPath()));
    }

    private String buildAvatarUrl(String avatarPath) {
        if (avatarPath == null || avatarPath.isBlank()) {
            return null;
        }

        return avatarPath;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}