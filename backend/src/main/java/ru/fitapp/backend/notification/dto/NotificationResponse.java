package ru.fitapp.backend.notification.dto;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long id;
    private String type;
    private String kind;
    private String title;
    private String body;
    private String relatedEntityType;
    private Long relatedEntityId;
    private Long actorId;
    private String actorName;
    private boolean read;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public NotificationResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public String getType() {
        return type;
    }

    public NotificationResponse setType(String type) {
        this.type = type;
        return this;
    }

    public String getKind() {
        return kind;
    }

    public NotificationResponse setKind(String kind) {
        this.kind = kind;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public NotificationResponse setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getBody() {
        return body;
    }

    public NotificationResponse setBody(String body) {
        this.body = body;
        return this;
    }

    public String getRelatedEntityType() {
        return relatedEntityType;
    }

    public NotificationResponse setRelatedEntityType(String relatedEntityType) {
        this.relatedEntityType = relatedEntityType;
        return this;
    }

    public Long getRelatedEntityId() {
        return relatedEntityId;
    }

    public NotificationResponse setRelatedEntityId(Long relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
        return this;
    }

    public Long getActorId() {
        return actorId;
    }

    public NotificationResponse setActorId(Long actorId) {
        this.actorId = actorId;
        return this;
    }

    public String getActorName() {
        return actorName;
    }

    public NotificationResponse setActorName(String actorName) {
        this.actorName = actorName;
        return this;
    }

    public boolean isRead() {
        return read;
    }

    public NotificationResponse setRead(boolean read) {
        this.read = read;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public NotificationResponse setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }
}
