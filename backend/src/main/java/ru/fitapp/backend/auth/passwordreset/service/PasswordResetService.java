package ru.fitapp.backend.auth.passwordreset.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.auth.passwordreset.dto.PasswordResetLinkResponse;
import ru.fitapp.backend.auth.passwordreset.entity.PasswordResetToken;
import ru.fitapp.backend.auth.passwordreset.repository.PasswordResetTokenRepository;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.mail.MailService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserStatus;
import ru.fitapp.backend.user.service.UserService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;

@Service
@Transactional
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    /** The trainer sends the link in a messenger and the client may open it later than an email link. */
    private static final long TRAINER_LINK_HOURS = 24;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.public-base-url:http://localhost:3000}")
    private String publicBaseUrl;

    @Value("${app.password-reset.expiration-minutes:60}")
    private long expirationMinutes;

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UserService userService,
            PasswordEncoder passwordEncoder,
            MailService mailService
    ) {
        this.tokenRepository = tokenRepository;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
    }

    /**
     * Always succeeds from the caller's perspective (no user enumeration):
     * if the email belongs to an active user, a reset link is emailed.
     */
    public void requestReset(String email) {
        userService.findActiveByEmail(email).ifPresent(user -> {
            String rawToken = generateRawToken();

            PasswordResetToken token = new PasswordResetToken()
                    .setUserId(user.getId())
                    .setTokenHash(hash(rawToken))
                    .setExpiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                    .setCreatedAt(LocalDateTime.now());
            tokenRepository.save(token);

            String link = publicBaseUrl + "/reset-password?token=" + rawToken;
            mailService.sendPasswordReset(user.getEmail(), link);
        });
    }

    /**
     * The trainer issues a one-time link for a registered client who can't sign in and can't get the email
     * (FIT-71). Earlier unused links of the client stop working.
     */
    public PasswordResetLinkResponse createLinkForClient(AppUser client) {
        if (client.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException("CLIENT_NOT_ACTIVE", "Клиент в архиве или удалил аккаунт — ссылку выдать нельзя");
        }
        if (!client.isClaimedByClient()) {
            throw new ApiException("CLIENT_NOT_REGISTERED", "Клиент ещё не зарегистрировался — отправьте ему приглашение");
        }

        LocalDateTime now = LocalDateTime.now();
        tokenRepository.invalidateUnused(client.getId(), now);

        String rawToken = generateRawToken();
        LocalDateTime expiresAt = now.plusHours(TRAINER_LINK_HOURS);
        tokenRepository.save(new PasswordResetToken()
                .setUserId(client.getId())
                .setTokenHash(hash(rawToken))
                .setExpiresAt(expiresAt)
                .setCreatedAt(now));

        return new PasswordResetLinkResponse(
                publicBaseUrl + "/reset-password?token=" + rawToken,
                expiresAt.atZone(ZoneId.systemDefault()).toInstant()
        );
    }

    /** Returns the user whose password was changed (FIT-83: the login form is prefilled with their login). */
    public AppUser resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = tokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new ApiException("INVALID_TOKEN", "Ссылка недействительна"));

        if (token.getUsedAt() != null) {
            throw new ApiException("TOKEN_USED", "Ссылка уже использована");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("TOKEN_EXPIRED", "Срок действия ссылки истёк");
        }

        AppUser user = userService.getById(token.getUserId());
        userService.updatePasswordHash(user, passwordEncoder.encode(newPassword));

        token.setUsedAt(LocalDateTime.now());
        tokenRepository.save(token);
        return user;
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception ex) {
            throw new ApiException("INTERNAL_ERROR", "Не удалось обработать токен");
        }
    }
}
