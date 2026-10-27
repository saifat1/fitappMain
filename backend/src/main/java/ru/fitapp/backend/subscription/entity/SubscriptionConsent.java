package ru.fitapp.backend.subscription.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.subscription.model.BillingPeriod;
import ru.fitapp.backend.subscription.model.SubscriptionPlan;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;

/** FIT-80: a consent to automatic charges (or its withdrawal) — kept as history, never changed. */
@Entity
@Table(name = "subscription_consent")
public class SubscriptionConsent {

    public enum Action {
        GRANTED,
        REVOKED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_subscription_consent_trainer"))
    private AppUser trainer;

    @Column(name = "payment_id")
    private Long paymentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 16)
    private Action action;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", length = 16)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_period", length = 8)
    private BillingPeriod billingPeriod;

    @Column(name = "amount_kopecks")
    private Integer amountKopecks;

    @Column(name = "consent_text", nullable = false, length = 500)
    private String consentText;

    @Column(name = "offer_version", nullable = false, length = 16)
    private String offerVersion;

    @Column(name = "ip", length = 64)
    private String ip;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() {
        return id;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public SubscriptionConsent setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public SubscriptionConsent setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
        return this;
    }

    public Action getAction() {
        return action;
    }

    public SubscriptionConsent setAction(Action action) {
        this.action = action;
        return this;
    }

    public SubscriptionPlan getPlan() {
        return plan;
    }

    public SubscriptionConsent setPlan(SubscriptionPlan plan) {
        this.plan = plan;
        return this;
    }

    public BillingPeriod getBillingPeriod() {
        return billingPeriod;
    }

    public SubscriptionConsent setBillingPeriod(BillingPeriod billingPeriod) {
        this.billingPeriod = billingPeriod;
        return this;
    }

    public Integer getAmountKopecks() {
        return amountKopecks;
    }

    public SubscriptionConsent setAmountKopecks(Integer amountKopecks) {
        this.amountKopecks = amountKopecks;
        return this;
    }

    public String getConsentText() {
        return consentText;
    }

    public SubscriptionConsent setConsentText(String consentText) {
        this.consentText = consentText;
        return this;
    }

    public String getOfferVersion() {
        return offerVersion;
    }

    public SubscriptionConsent setOfferVersion(String offerVersion) {
        this.offerVersion = offerVersion;
        return this;
    }

    public String getIp() {
        return ip;
    }

    public SubscriptionConsent setIp(String ip) {
        this.ip = ip;
        return this;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public SubscriptionConsent setUserAgent(String userAgent) {
        this.userAgent = userAgent;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
