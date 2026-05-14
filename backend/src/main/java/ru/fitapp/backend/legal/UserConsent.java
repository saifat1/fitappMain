package ru.fitapp.backend.legal;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_consent")
public class UserConsent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_type", nullable = false, length = 100)
    private ConsentType consentType;

    @Column(name = "document_version", nullable = false, length = 50)
    private String documentVersion;

    @Column(name = "accepted_at", nullable = false)
    private LocalDateTime acceptedAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    public Long getId() {
        return id;
    }

    public UserConsent setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getUser() {
        return user;
    }

    public UserConsent setUser(AppUser user) {
        this.user = user;
        return this;
    }

    public ConsentType getConsentType() {
        return consentType;
    }

    public UserConsent setConsentType(ConsentType consentType) {
        this.consentType = consentType;
        return this;
    }

    public String getDocumentVersion() {
        return documentVersion;
    }

    public UserConsent setDocumentVersion(String documentVersion) {
        this.documentVersion = documentVersion;
        return this;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public UserConsent setAcceptedAt(LocalDateTime acceptedAt) {
        this.acceptedAt = acceptedAt;
        return this;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public UserConsent setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
        return this;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public UserConsent setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
        return this;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public UserConsent setUserAgent(String userAgent) {
        this.userAgent = userAgent;
        return this;
    }
}