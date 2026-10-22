package ru.fitapp.backend.pushsubscription.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.pushsubscription.dto.RegisterDeviceTokenRequest;
import ru.fitapp.backend.pushsubscription.entity.DevicePushToken;
import ru.fitapp.backend.pushsubscription.repository.DevicePushTokenRepository;
import ru.fitapp.backend.user.entity.AppUser;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Push to the store app (Android / iOS) via Firebase Cloud Messaging HTTP v1 (FIT-69).
 *
 * Enabled when FCM_CREDENTIALS_BASE64 holds the Firebase service-account JSON (base64, server .env only — it is a secret).
 * Like WebPushService, delivery failures are logged and never break the calling business flow.
 */
@Service
public class FcmPushService {

    private static final Logger log = LoggerFactory.getLogger(FcmPushService.class);
    private static final String SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
    /** Must match ANDROID_CHANNEL_ID in the app (frontend/src/features/push/lib/nativePush.ts). */
    private static final String ANDROID_CHANNEL_ID = "fitapp_default";

    private final DevicePushTokenRepository tokenRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    @Value("${app.push.fcm.credentials-base64:}")
    private String credentialsBase64;

    private GoogleCredentials credentials;
    private String projectId;

    public FcmPushService(DevicePushTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @PostConstruct
    public void init() {
        if (credentialsBase64 == null || credentialsBase64.isBlank()) {
            log.info("[FCM DISABLED] Set FCM_CREDENTIALS_BASE64 to send push to the store app");
            return;
        }
        try {
            byte[] json = Base64.getDecoder().decode(credentialsBase64.trim());
            ServiceAccountCredentials account = ServiceAccountCredentials.fromStream(new ByteArrayInputStream(json));
            credentials = account.createScoped(List.of(SCOPE));
            projectId = account.getProjectId();
            log.info("FCM push enabled for Firebase project {}", projectId);
        } catch (Exception ex) {
            log.error("Failed to read FCM_CREDENTIALS_BASE64 — store app push stays off: {}", ex.getMessage());
            credentials = null;
        }
    }

    /** Saves the device token for the user; a token that moved to another account (re-login on the phone) is re-assigned. */
    @Transactional
    public void registerDevice(AppUser user, RegisterDeviceTokenRequest request) {
        DevicePushToken token = tokenRepository.findByToken(request.getToken()).orElseGet(DevicePushToken::new);
        token.setUser(user).setToken(request.getToken()).setPlatform(request.getPlatform());
        tokenRepository.save(token);
    }

    @Transactional
    public void unregisterDevice(String token) {
        tokenRepository.deleteByToken(token);
    }

    /** Sends to every device of the user. Never throws. */
    @Transactional
    public void sendToUser(AppUser user, String title, String body, Map<String, Object> data) {
        if (credentials == null) {
            return;
        }

        List<DevicePushToken> tokens = tokenRepository.findAllByUserId(user.getId());
        if (tokens.isEmpty()) {
            return;
        }

        String accessToken;
        try {
            credentials.refreshIfExpired();
            accessToken = credentials.getAccessToken().getTokenValue();
        } catch (Exception ex) {
            log.error("Failed to get FCM access token: {}", ex.getMessage());
            return;
        }

        // FCM data values must be strings.
        Map<String, String> stringData = new LinkedHashMap<>();
        if (data != null) {
            data.forEach((key, value) -> stringData.put(key, value != null ? String.valueOf(value) : ""));
        }

        for (DevicePushToken token : tokens) {
            try {
                Map<String, Object> message = Map.of("message", Map.of(
                        "token", token.getToken(),
                        "notification", Map.of("title", title, "body", body != null ? body : ""),
                        "data", stringData,
                        "android", Map.of(
                                "priority", "HIGH",
                                "notification", Map.of("channel_id", ANDROID_CHANNEL_ID)
                        )
                ));

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://fcm.googleapis.com/v1/projects/" + projectId + "/messages:send"))
                        .timeout(Duration.ofSeconds(10))
                        .header("Authorization", "Bearer " + accessToken)
                        .header("Content-Type", "application/json; charset=UTF-8")
                        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(message)))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                int status = response.statusCode();

                if (status == 404 || (status == 400 && isInvalidToken(response.body()))) {
                    // The app was removed or the token rotated — forget this device.
                    log.info("FCM rejected the token of a device of user {} — removed", user.getId());
                    tokenRepository.delete(token);
                } else if (status >= 400) {
                    log.warn("FCM delivery returned status {}: {}", status, response.body());
                }
            } catch (Exception ex) {
                log.error("Failed to deliver FCM push to user {}: {}", user.getId(), ex.getMessage());
            }
        }
    }

    private boolean isInvalidToken(String body) {
        try {
            JsonNode error = objectMapper.readTree(body).path("error");
            String text = error.toString();
            return text.contains("UNREGISTERED") || text.contains("registration token");
        } catch (Exception ex) {
            return false;
        }
    }
}
