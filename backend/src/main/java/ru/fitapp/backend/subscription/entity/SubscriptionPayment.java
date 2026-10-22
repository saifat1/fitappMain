package ru.fitapp.backend.subscription.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.subscription.model.BillingPeriod;
import ru.fitapp.backend.subscription.model.PaymentPurpose;
import ru.fitapp.backend.subscription.model.PaymentStatus;
import ru.fitapp.backend.subscription.model.SubscriptionPlan;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "subscription_payment")
public class SubscriptionPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_subscription_payment_trainer")
    )
    private AppUser trainer;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false, length = 16)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_period", nullable = false, length = 8)
    private BillingPeriod billingPeriod;

    @Column(name = "amount_kopecks", nullable = false)
    private Integer amountKopecks;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false, length = 16)
    private PaymentPurpose purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "provider", nullable = false, length = 32)
    private String provider;

    @Column(name = "provider_payment_id", length = 128)
    private String providerPaymentId;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    public Long getId() {
        return id;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public SubscriptionPayment setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public SubscriptionPlan getPlan() {
        return plan;
    }

    public SubscriptionPayment setPlan(SubscriptionPlan plan) {
        this.plan = plan;
        return this;
    }

    public BillingPeriod getBillingPeriod() {
        return billingPeriod;
    }

    public SubscriptionPayment setBillingPeriod(BillingPeriod billingPeriod) {
        this.billingPeriod = billingPeriod;
        return this;
    }

    public Integer getAmountKopecks() {
        return amountKopecks;
    }

    public SubscriptionPayment setAmountKopecks(Integer amountKopecks) {
        this.amountKopecks = amountKopecks;
        return this;
    }

    public PaymentPurpose getPurpose() {
        return purpose;
    }

    public SubscriptionPayment setPurpose(PaymentPurpose purpose) {
        this.purpose = purpose;
        return this;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public SubscriptionPayment setStatus(PaymentStatus status) {
        this.status = status;
        return this;
    }

    public String getProvider() {
        return provider;
    }

    public SubscriptionPayment setProvider(String provider) {
        this.provider = provider;
        return this;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public SubscriptionPayment setProviderPaymentId(String providerPaymentId) {
        this.providerPaymentId = providerPaymentId;
        return this;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public SubscriptionPayment setFailureReason(String failureReason) {
        this.failureReason = failureReason;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public SubscriptionPayment setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SubscriptionPayment that)) return false;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
