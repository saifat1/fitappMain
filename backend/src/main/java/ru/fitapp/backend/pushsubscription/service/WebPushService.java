package ru.fitapp.backend.pushsubscription.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.fitapp.backend.pushsubscription.dto.SubscribePushRequest;
import ru.fitapp.backend.pushsubscription.entity.PushSubscription;
import ru.fitapp.backend.pushsubscription.repository.PushSubscriptionRepository;
import ru.fitapp.backend.user.entity.AppUser;

import java.security.Security;
import java.util.List;
import java.util.Map;

/**
 * Sends browser/PWA push notifications via the Web Push protocol (VAPID).
 *
 * Requires three env vars in production (see application.yaml):
 *   PUSH_VAPID_PUBLIC_KEY, PUSH_VAPID_PRIVATE_KEY, PUSH_VAPID_SUBJECT
 * Generate a keypair once with `npx web-push generate-vapid-keys` and keep
 * the private key secret (same handling as the JWT secret / SMTP password).
 *
 * Mirrors MailService's philosophy: delivery failures are logged and never
 * allowed to break the calling business flow (creating a training, approving
 * a booking request, etc. must always succeed even if push delivery fails).
 */
@Service
public class WebPushService {

    private static final Logger log = LoggerFactory.getLogger(WebPushService.class);

    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.push.enabled:false}")
    private boolean pushEnabled;

    @Value("${app.push.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${app.push.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${app.push.vapid.subject:mailto:no-reply@fitapp.com.ru}")
    private String vapidSubject;

    private PushService pushService;

    public WebPushService(PushSubscriptionRepository pushSubscriptionRepository) {
        this.pushSubscriptionRepository = pushSubscriptionRepository;
    }

    @PostConstruct
    public void init() {
        Security.addProvider(new BouncyCastleProvider());

        if (!pushEnabled) {
            log.info("[PUSH DISABLED] Set app.push.enabled=true and VAPID keys to enable web push");
            return;
        }

        try {
            pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
        } catch (Exception ex) {
            log.error("Failed to initialize PushService — check VAPID key format: {}", ex.getMessage());
        }
    }

    public String getPublicKey() {
        return vapidPublicKey;
    }

    public void subscribe(AppUser user, SubscribePushRequest request) {
        PushSubscription subscription = pushSubscriptionRepository
                .findByUserIdAndEndpoint(user.getId(), request.getEndpoint())
                .orElseGet(PushSubscription::new);

        subscription
                .setUser(user)
                .setEndpoint(request.getEndpoint())
                .setP256dhKey(request.getP256dhKey())
                .setAuthKey(request.getAuthKey())
                .setUserAgent(request.getUserAgent());

        pushSubscriptionRepository.save(subscription);
    }

    public void unsubscribe(String endpoint) {
        pushSubscriptionRepository.deleteByEndpoint(endpoint);
    }

    /**
     * Sends a push notification to every device the user has subscribed
     * from. Never throws — a delivery failure for one (or all) devices must
     * not affect the caller's transaction.
     */
    public void sendToUser(AppUser user, String title, String body, Map<String, Object> data) {
        if (!pushEnabled || pushService == null) {
            log.info("[PUSH DISABLED] To user {} | {}: {}", user.getId(), title, body);
            return;
        }

        List<PushSubscription> subscriptions = pushSubscriptionRepository.findAllByUserId(user.getId());
        if (subscriptions.isEmpty()) {
            return;
        }

        String payload;
        try {
            payload = objectMapper.writeValueAsString(Map.of(
                    "title", title,
                    "body", body != null ? body : "",
                    "data", data != null ? data : Map.of()
            ));
        } catch (Exception ex) {
            log.error("Failed to serialize push payload: {}", ex.getMessage());
            return;
        }

        for (PushSubscription subscription : subscriptions) {
            try {
                Notification notification = new Notification(
                        subscription.getEndpoint(),
                        subscription.getP256dhKey(),
                        subscription.getAuthKey(),
                        payload.getBytes()
                );

                var response = pushService.send(notification);
                int status = response.getStatusLine().getStatusCode();

                // 404/410 mean the browser subscription is gone for good — clean it up.
                if (status == 404 || status == 410) {
                    pushSubscriptionRepository.delete(subscription);
                } else if (status >= 400) {
                    log.warn("Push delivery to {} returned status {}", subscription.getEndpoint(), status);
                }
            } catch (Exception ex) {
                log.error("Failed to deliver push to {}: {}", subscription.getEndpoint(), ex.getMessage());
            }
        }
    }
}
