package ru.fitapp.backend.pushsubscription.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "push_subscription")
public class PushSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_push_subscription_user")
    )
    private AppUser user;

    @Column(name = "endpoint", nullable = false, length = 1000)
    private String endpoint;

    @Column(name = "p256dh_key", nullable = false)
    private String p256dhKey;

    @Column(name = "auth_key", nullable = false)
    private String authKey;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public PushSubscription setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getUser() {
        return user;
    }

    public PushSubscription setUser(AppUser user) {
        this.user = user;
        return this;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public PushSubscription setEndpoint(String endpoint) {
        this.endpoint = endpoint;
        return this;
    }

    public String getP256dhKey() {
        return p256dhKey;
    }

    public PushSubscription setP256dhKey(String p256dhKey) {
        this.p256dhKey = p256dhKey;
        return this;
    }

    public String getAuthKey() {
        return authKey;
    }

    public PushSubscription setAuthKey(String authKey) {
        this.authKey = authKey;
        return this;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public PushSubscription setUserAgent(String userAgent) {
        this.userAgent = userAgent;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public PushSubscription setCreatedAt(LocalDateTime createdAt) {
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
        if (!(o instanceof PushSubscription that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
