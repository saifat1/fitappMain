package ru.fitapp.backend.trainerclient.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
        name = "trainer_client",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_trainer_client_trainer_client",
                        columnNames = {"trainer_id", "client_id"}
                )
        }
)
public class TrainerClient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_trainer_client_trainer")
    )
    private AppUser trainer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_trainer_client_client")
    )
    private AppUser client;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public TrainerClient() {
    }

    public Long getId() {
        return id;
    }

    public TrainerClient setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public TrainerClient setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public AppUser getClient() {
        return client;
    }

    public TrainerClient setClient(AppUser client) {
        this.client = client;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public TrainerClient setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TrainerClient that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}