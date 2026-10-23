package ru.fitapp.backend.feedback.dto;

import java.time.LocalDateTime;

/** Author fields are filled only in the admin list. */
public record FeedbackResponse(
        Long id,
        String type,
        String text,
        String status,
        String platform,
        String screen,
        LocalDateTime createdAt,
        Long authorId,
        String authorName,
        String authorEmail,
        String authorRole
) {
}
