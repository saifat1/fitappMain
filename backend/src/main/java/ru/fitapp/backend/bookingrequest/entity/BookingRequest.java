package ru.fitapp.backend.bookingrequest.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.bookingrequest.model.BookingRequestStatus;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "booking_request")
public class BookingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_booking_request_trainer")
    )
    private AppUser trainer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_booking_request_client")
    )
    private AppUser client;

    @Column(name = "requested_start", nullable = false)
    private LocalDateTime requestedStart;

    @Column(name = "requested_end", nullable = false)
    private LocalDateTime requestedEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private BookingRequestStatus status;

    @Column(name = "client_comment", length = 2000)
    private String clientComment;

    @Column(name = "trainer_comment", length = 2000)
    private String trainerComment;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public BookingRequest setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public BookingRequest setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public AppUser getClient() {
        return client;
    }

    public BookingRequest setClient(AppUser client) {
        this.client = client;
        return this;
    }

    public LocalDateTime getRequestedStart() {
        return requestedStart;
    }

    public BookingRequest setRequestedStart(LocalDateTime requestedStart) {
        this.requestedStart = requestedStart;
        return this;
    }

    public LocalDateTime getRequestedEnd() {
        return requestedEnd;
    }

    public BookingRequest setRequestedEnd(LocalDateTime requestedEnd) {
        this.requestedEnd = requestedEnd;
        return this;
    }

    public BookingRequestStatus getStatus() {
        return status;
    }

    public BookingRequest setStatus(BookingRequestStatus status) {
        this.status = status;
        return this;
    }

    public String getClientComment() {
        return clientComment;
    }

    public BookingRequest setClientComment(String clientComment) {
        this.clientComment = clientComment;
        return this;
    }

    public String getTrainerComment() {
        return trainerComment;
    }

    public BookingRequest setTrainerComment(String trainerComment) {
        this.trainerComment = trainerComment;
        return this;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public BookingRequest setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public BookingRequest setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public BookingRequest setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = BookingRequestStatus.PENDING;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BookingRequest that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
