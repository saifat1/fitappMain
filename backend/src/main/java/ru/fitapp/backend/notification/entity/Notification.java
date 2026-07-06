package ru.fitapp.backend.notification.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.notification.model.NotificationType;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "recipient_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_notification_recipient")
    )
    private AppUser recipient;

    /**
     * The user whose action triggered this notification (e.g. the client who
     * requested a training). Null for system-generated notifications.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "actor_id",
            foreignKey = @ForeignKey(name = "fk_notification_actor")
    )
    private AppUser actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "body", length = 1000)
    private String body;

    /**
     * Loose polymorphic reference (e.g. "TRAINING", "BOOKING_REQUEST",
     * "RESCHEDULE_REQUEST") so the frontend knows where to navigate on tap,
     * without needing a JPA relation to every possible target entity.
     */
    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType;

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public Notification setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getRecipient() {
        return recipient;
    }

    public Notification setRecipient(AppUser recipient) {
        this.recipient = recipient;
        return this;
    }

    public AppUser getActor() {
        return actor;
    }

    public Notification setActor(AppUser actor) {
        this.actor = actor;
        return this;
    }

    public NotificationType getType() {
        return type;
    }

    public Notification setType(NotificationType type) {
        this.type = type;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public Notification setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getBody() {
        return body;
    }

    public Notification setBody(String body) {
        this.body = body;
        return this;
    }

    public String getRelatedEntityType() {
        return relatedEntityType;
    }

    public Notification setRelatedEntityType(String relatedEntityType) {
        this.relatedEntityType = relatedEntityType;
        return this;
    }

    public Long getRelatedEntityId() {
        return relatedEntityId;
    }

    public Notification setRelatedEntityId(Long relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
        return this;
    }

    public boolean isRead() {
        return read;
    }

    public Notification setRead(boolean read) {
        this.read = read;
        return this;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public Notification setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Notification setCreatedAt(LocalDateTime createdAt) {
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
        if (!(o instanceof Notification that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
