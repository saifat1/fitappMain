package ru.fitapp.backend.feedback.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.feedback.model.FeedbackStatus;
import ru.fitapp.backend.feedback.model.FeedbackType;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;

/** An idea or a problem report from a trainer or a client (FIT-73). */
@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_feedback_user"))
    private AppUser user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 16)
    private FeedbackType type;

    @Column(name = "text", nullable = false, length = 4000)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private FeedbackStatus status;

    @Column(name = "platform", nullable = false, length = 16)
    private String platform;

    @Column(name = "screen", length = 200)
    private String screen;

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

    public Feedback setUser(AppUser user) {
        this.user = user;
        return this;
    }

    public FeedbackType getType() {
        return type;
    }

    public Feedback setType(FeedbackType type) {
        this.type = type;
        return this;
    }

    public String getText() {
        return text;
    }

    public Feedback setText(String text) {
        this.text = text;
        return this;
    }

    public FeedbackStatus getStatus() {
        return status;
    }

    public Feedback setStatus(FeedbackStatus status) {
        this.status = status;
        return this;
    }

    public String getPlatform() {
        return platform;
    }

    public Feedback setPlatform(String platform) {
        this.platform = platform;
        return this;
    }

    public String getScreen() {
        return screen;
    }

    public Feedback setScreen(String screen) {
        this.screen = screen;
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
        if (this.status == null) {
            this.status = FeedbackStatus.NEW;
        }
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
