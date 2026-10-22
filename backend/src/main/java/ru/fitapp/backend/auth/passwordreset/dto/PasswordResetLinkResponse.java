package ru.fitapp.backend.auth.passwordreset.dto;

import java.time.LocalDateTime;

/** One-time «set a new password» link the trainer passes to the client in a messenger. */
public record PasswordResetLinkResponse(String link, LocalDateTime expiresAt) {
}
