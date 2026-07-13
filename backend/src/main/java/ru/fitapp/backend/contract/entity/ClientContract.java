package ru.fitapp.backend.contract.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * A paid training package ("договор"): a client can have several of these
 * (usually just one), each covering a fixed number of trainings. Consumed
 * one-by-one as trainings under it are completed — see
 * ClientContractService.consumeOneForCompletedTraining.
 */
@Entity
@Table(name = "client_contract")
public class ClientContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_client_contract_client")
    )
    private AppUser client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_client_contract_trainer")
    )
    private AppUser trainer;

    @Column(name = "contract_number", length = 255)
    private String contractNumber;

    @Column(name = "total_trainings", nullable = false)
    private int totalTrainings;

    @Column(name = "remaining_trainings", nullable = false)
    private int remainingTrainings;

    /** Optional — when set, the trainer is nudged ~10 days before this date. Nothing happens to the client once it passes. */
    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "expiry_notified", nullable = false)
    private boolean expiryNotified = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public ClientContract setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getClient() {
        return client;
    }

    public ClientContract setClient(AppUser client) {
        this.client = client;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public ClientContract setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public String getContractNumber() {
        return contractNumber;
    }

    public ClientContract setContractNumber(String contractNumber) {
        this.contractNumber = contractNumber;
        return this;
    }

    public int getTotalTrainings() {
        return totalTrainings;
    }

    public ClientContract setTotalTrainings(int totalTrainings) {
        this.totalTrainings = totalTrainings;
        return this;
    }

    public int getRemainingTrainings() {
        return remainingTrainings;
    }

    public ClientContract setRemainingTrainings(int remainingTrainings) {
        this.remainingTrainings = remainingTrainings;
        return this;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public ClientContract setEndDate(LocalDate endDate) {
        this.endDate = endDate;
        return this;
    }

    public boolean isExpiryNotified() {
        return expiryNotified;
    }

    public ClientContract setExpiryNotified(boolean expiryNotified) {
        this.expiryNotified = expiryNotified;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public ClientContract setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ClientContract that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
