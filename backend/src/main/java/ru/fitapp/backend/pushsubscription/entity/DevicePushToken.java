package ru.fitapp.backend.pushsubscription.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;

/** Firebase Cloud Messaging token of one device running the store app (FIT-69). */
@Entity
@Table(name = "device_push_token")
public class DevicePushToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_device_push_token_user")
    )
    private AppUser user;

    @Column(name = "token", nullable = false, length = 4096)
    private String token;

    /** ANDROID or IOS. */
    @Column(name = "platform", nullable = false, length = 16)
    private String platform;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public DevicePushToken setUser(AppUser user) {
        this.user = user;
        return this;
    }

    public String getToken() {
        return token;
    }

    public DevicePushToken setToken(String token) {
        this.token = token;
        return this;
    }

    public String getPlatform() {
        return platform;
    }

    public DevicePushToken setPlatform(String platform) {
        this.platform = platform;
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
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
