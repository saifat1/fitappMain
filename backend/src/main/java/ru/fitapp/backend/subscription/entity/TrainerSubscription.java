package ru.fitapp.backend.subscription.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.subscription.model.BillingPeriod;
import ru.fitapp.backend.subscription.model.SubscriptionPlan;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * One row per trainer, created on first access. The effective plan is derived from the dates
 * (see SubscriptionService.resolve): trial → Pro, paid period / grace → {@link #plan}, else FREE.
 */
@Entity
@Table(name = "trainer_subscription")
public class TrainerSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_trainer_subscription_trainer")
    )
    private AppUser trainer;

    /** Last purchased plan; FREE until the first payment. */
    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false, length = 16)
    private SubscriptionPlan plan = SubscriptionPlan.FREE;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_period", length = 8)
    private BillingPeriod billingPeriod;

    @Column(name = "trial_ends_at")
    private LocalDateTime trialEndsAt;

    @Column(name = "paid_until")
    private LocalDateTime paidUntil;

    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew = false;

    /** Provider's id of the saved card used for renewals; null — nothing to charge. */
    @Column(name = "payment_method_token", length = 255)
    private String paymentMethodToken;

    /** "Карта •• 4242" — shown on the «Подписка» screen. */
    @Column(name = "payment_method_title", length = 64)
    private String paymentMethodTitle;

    @Column(name = "last_renewal_attempt_at")
    private LocalDateTime lastRenewalAttemptAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public TrainerSubscription setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public SubscriptionPlan getPlan() {
        return plan;
    }

    public TrainerSubscription setPlan(SubscriptionPlan plan) {
        this.plan = plan;
        return this;
    }

    public BillingPeriod getBillingPeriod() {
        return billingPeriod;
    }

    public TrainerSubscription setBillingPeriod(BillingPeriod billingPeriod) {
        this.billingPeriod = billingPeriod;
        return this;
    }

    public LocalDateTime getTrialEndsAt() {
        return trialEndsAt;
    }

    public TrainerSubscription setTrialEndsAt(LocalDateTime trialEndsAt) {
        this.trialEndsAt = trialEndsAt;
        return this;
    }

    public LocalDateTime getPaidUntil() {
        return paidUntil;
    }

    public TrainerSubscription setPaidUntil(LocalDateTime paidUntil) {
        this.paidUntil = paidUntil;
        return this;
    }

    public Boolean getAutoRenew() {
        return autoRenew;
    }

    public TrainerSubscription setAutoRenew(Boolean autoRenew) {
        this.autoRenew = autoRenew;
        return this;
    }

    public String getPaymentMethodToken() {
        return paymentMethodToken;
    }

    public TrainerSubscription setPaymentMethodToken(String paymentMethodToken) {
        this.paymentMethodToken = paymentMethodToken;
        return this;
    }

    public String getPaymentMethodTitle() {
        return paymentMethodTitle;
    }

    public TrainerSubscription setPaymentMethodTitle(String paymentMethodTitle) {
        this.paymentMethodTitle = paymentMethodTitle;
        return this;
    }

    public LocalDateTime getLastRenewalAttemptAt() {
        return lastRenewalAttemptAt;
    }

    public TrainerSubscription setLastRenewalAttemptAt(LocalDateTime lastRenewalAttemptAt) {
        this.lastRenewalAttemptAt = lastRenewalAttemptAt;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TrainerSubscription that)) return false;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
