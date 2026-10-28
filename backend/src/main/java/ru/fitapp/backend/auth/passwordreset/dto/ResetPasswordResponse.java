package ru.fitapp.backend.auth.passwordreset.dto;

import ru.fitapp.backend.user.model.UserRole;

/**
 * FIT-83: whose password was changed — the login form is prefilled with this login (not the browser's saved one),
 * and on a client's device the way to the trainer registration is hidden.
 */
public record ResetPasswordResponse(String message, String email, UserRole role) {
}
