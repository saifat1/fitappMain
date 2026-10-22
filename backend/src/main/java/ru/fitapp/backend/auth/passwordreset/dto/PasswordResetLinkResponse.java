package ru.fitapp.backend.auth.passwordreset.dto;

import java.time.Instant;

/** One-time «set a new password» link the trainer passes to the client in a messenger. Instant: the phone shows its own local time. */
public record PasswordResetLinkResponse(String link, Instant expiresAt) {
}
