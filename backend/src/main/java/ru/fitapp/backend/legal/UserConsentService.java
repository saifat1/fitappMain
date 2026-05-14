package ru.fitapp.backend.legal;

import jakarta.persistence.EntityManager;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserConsentService {

    private static final Map<ConsentType, String> REQUIRED_CONSENTS = Map.of(
            ConsentType.TERMS_ACCEPTED, "1.0",
            ConsentType.PERSONAL_DATA_PROCESSING, "1.0",
            ConsentType.HEALTH_DATA_PROCESSING, "1.0"
    );

    private final UserConsentRepository userConsentRepository;
    private final EntityManager entityManager;

    public UserConsentService(
            UserConsentRepository userConsentRepository,
            EntityManager entityManager
    ) {
        this.userConsentRepository = userConsentRepository;
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public List<ConsentType> getRequiredMissingConsents(Long userId) {
        List<UserConsent> activeConsents = userConsentRepository.findByUserIdAndRevokedAtIsNull(userId);

        Set<String> accepted = new HashSet<>();

        for (UserConsent consent : activeConsents) {
            accepted.add(consent.getConsentType().name() + ":" + consent.getDocumentVersion());
        }

        List<ConsentType> missing = new ArrayList<>();

        for (Map.Entry<ConsentType, String> requiredConsent : REQUIRED_CONSENTS.entrySet()) {
            String requiredKey = requiredConsent.getKey().name() + ":" + requiredConsent.getValue();

            if (!accepted.contains(requiredKey)) {
                missing.add(requiredConsent.getKey());
            }
        }

        return missing;
    }

    @Transactional
    public void acceptRequiredConsents(Long userId, HttpServletRequest request) {
        AppUser userRef = entityManager.getReference(AppUser.class, userId);

        LocalDateTime now = LocalDateTime.now();
        String ipAddress = extractIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        List<ConsentType> missingConsents = getRequiredMissingConsents(userId);

        for (ConsentType consentType : missingConsents) {
            UserConsent consent = new UserConsent()
                    .setUser(userRef)
                    .setConsentType(consentType)
                    .setDocumentVersion(REQUIRED_CONSENTS.get(consentType))
                    .setAcceptedAt(now)
                    .setIpAddress(ipAddress)
                    .setUserAgent(userAgent);

            userConsentRepository.save(consent);
        }
    }

    private String extractIpAddress(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }
}