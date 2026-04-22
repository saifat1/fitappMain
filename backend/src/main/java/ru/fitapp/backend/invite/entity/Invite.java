package ru.fitapp.backend.invite.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.invite.model.InviteStatus;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(
        name = "invite",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_invite_token", columnNames = "token")
        }
)
public class Invite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false, length = 255)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_invite_trainer"))
    private AppUser trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", foreignKey = @ForeignKey(name = "fk_invite_client"))
    private AppUser client;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private InviteStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Invite() {
    }

    public Long getId() {
        return id;
    }

    public Invite setId(Long id) {
        this.id = id;
        return this;
    }

    public String getToken() {
        return token;
    }

    public Invite setToken(String token) {
        this.token = token;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public Invite setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public AppUser getClient() {
        return client;
    }

    public Invite setClient(AppUser client) {
        this.client = client;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public Invite setEmail(String email) {
        this.email = email;
        return this;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public Invite setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
        return this;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public Invite setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
        return this;
    }

    public InviteStatus getStatus() {
        return status;
    }

    public Invite setStatus(InviteStatus status) {
        this.status = status;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Invite setCreatedAt(LocalDateTime createdAt) {
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
        if (!(o instanceof Invite invite)) return false;
        return Objects.equals(id, invite.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}