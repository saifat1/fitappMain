package ru.fitapp.backend.analytics.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.analytics.dto.TrackAnalyticsEventRequest;
import ru.fitapp.backend.analytics.entity.AnalyticsEvent;
import ru.fitapp.backend.analytics.model.AnalyticsEventType;
import ru.fitapp.backend.analytics.repository.AnalyticsEventRepository;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.service.UserService;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Service
@Transactional
public class AnalyticsService {

    private static final int MAX_USER_AGENT_LENGTH = 512;
    private static final int MAX_METADATA_LENGTH = 10_000;

    private final AnalyticsEventRepository eventRepository;
    private final UserService userService;

    public AnalyticsService(
            AnalyticsEventRepository eventRepository,
            UserService userService
    ) {
        this.eventRepository = eventRepository;
        this.userService = userService;
    }

    public void trackCurrentUserEvent(
            TrackAnalyticsEventRequest request,
            HttpServletRequest httpRequest
    ) {
        AppUser user = getCurrentUser();
        AnalyticsEventType eventType = parseEventType(request.getEventType());

        userService.markSeen(user);

        saveEvent(
                user,
                eventType,
                request.getSessionId(),
                request.getEntityType(),
                request.getEntityId(),
                request.getMetadata(),
                httpRequest
        );
    }

    public void trackLoginSuccess(AppUser user, HttpServletRequest httpRequest) {
        saveEvent(
                user,
                AnalyticsEventType.USER_LOGIN_SUCCESS,
                null,
                null,
                null,
                null,
                httpRequest
        );
    }

    public void trackUserAction(
            AppUser user,
            AnalyticsEventType eventType,
            String entityType,
            String entityId,
            String metadata
    ) {
        saveEvent(
                user,
                eventType,
                null,
                entityType,
                entityId,
                metadata,
                null
        );
    }

    private void saveEvent(
            AppUser user,
            AnalyticsEventType eventType,
            String sessionId,
            String entityType,
            String entityId,
            String metadata,
            HttpServletRequest httpRequest
    ) {
        AnalyticsEvent event = new AnalyticsEvent();

        event.setUser(user);
        event.setUserRole(user.getRole().name());
        event.setEventType(eventType.name());
        event.setOccurredAt(LocalDateTime.now());
        event.setSessionId(trimToNull(sessionId, 100));
        event.setEntityType(trimToNull(entityType, 100));
        event.setEntityId(trimToNull(entityId, 100));
        event.setMetadata(trimToNull(metadata, MAX_METADATA_LENGTH));

        if (httpRequest != null) {
            event.setUserAgent(trimToNull(httpRequest.getHeader("User-Agent"), MAX_USER_AGENT_LENGTH));
            event.setIpHash(hashIp(getClientIp(httpRequest)));
        }

        eventRepository.save(event);
    }

    private AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new ApiException("UNAUTHORIZED", "Пользователь не авторизован");
        }

        return userService.getByEmail(authentication.getName());
    }

    private AnalyticsEventType parseEventType(String value) {
        try {
            return AnalyticsEventType.valueOf(value);
        } catch (IllegalArgumentException exception) {
            throw new ApiException("UNKNOWN_ANALYTICS_EVENT", "Неизвестный тип события аналитики");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private String hashIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return null;
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ip.getBytes(StandardCharsets.UTF_8));

            StringBuilder result = new StringBuilder();

            for (byte item : hash) {
                result.append(String.format("%02x", item));
            }

            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            return null;
        }
    }

    private String trimToNull(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String trimmed = value.trim();

        if (trimmed.length() <= maxLength) {
            return trimmed;
        }

        return trimmed.substring(0, maxLength);
    }
}