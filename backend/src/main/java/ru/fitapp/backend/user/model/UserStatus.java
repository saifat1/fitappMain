package ru.fitapp.backend.user.model;

public enum UserStatus {
    ACTIVE,
    INACTIVE,
    /** The user deleted the account (FIT-70): personal data is wiped, login is impossible, the trainer can't restore it. */
    DELETED
}
