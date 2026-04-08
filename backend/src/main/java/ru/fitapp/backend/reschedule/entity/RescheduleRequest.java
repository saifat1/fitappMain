package ru.fitapp.backend.reschedule.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.reschedule.model.RescheduleRequestStatus;
import ru.fitapp.backend.training.entity.Training;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@Table(name = "reschedule_request")
public class RescheduleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "training_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_reschedule_request_training")
    )
    private Training training;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "requester_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_reschedule_request_requester")
    )
    private AppUser requester;

    @Column(name = "requested_training_date", nullable = false)
    private LocalDate requestedTrainingDate;

    @Column(name = "requested_start_time")
    private LocalTime requestedStartTime;

    @Column(name = "requested_end_time")
    private LocalTime requestedEndTime;

    @Column(name = "client_comment", length = 2000)
    private String clientComment;

    @Column(name = "trainer_comment", length = 2000)
    private String trainerComment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private RescheduleRequestStatus status;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public RescheduleRequest() {
    }

    public Long getId() {
        return id;
    }

    public RescheduleRequest setId(Long id) {
        this.id = id;
        return this;
    }

    public Training getTraining() {
        return training;
    }

    public RescheduleRequest setTraining(Training training) {
        this.training = training;
        return this;
    }

    public AppUser getRequester() {
        return requester;
    }

    public RescheduleRequest setRequester(AppUser requester) {
        this.requester = requester;
        return this;
    }

    public LocalDate getRequestedTrainingDate() {
        return requestedTrainingDate;
    }

    public RescheduleRequest setRequestedTrainingDate(LocalDate requestedTrainingDate) {
        this.requestedTrainingDate = requestedTrainingDate;
        return this;
    }

    public LocalTime getRequestedStartTime() {
        return requestedStartTime;
    }

    public RescheduleRequest setRequestedStartTime(LocalTime requestedStartTime) {
        this.requestedStartTime = requestedStartTime;
        return this;
    }

    public LocalTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public RescheduleRequest setRequestedEndTime(LocalTime requestedEndTime) {
        this.requestedEndTime = requestedEndTime;
        return this;
    }

    public String getClientComment() {
        return clientComment;
    }

    public RescheduleRequest setClientComment(String clientComment) {
        this.clientComment = clientComment;
        return this;
    }

    public String getTrainerComment() {
        return trainerComment;
    }

    public RescheduleRequest setTrainerComment(String trainerComment) {
        this.trainerComment = trainerComment;
        return this;
    }

    public RescheduleRequestStatus getStatus() {
        return status;
    }

    public RescheduleRequest setStatus(RescheduleRequestStatus status) {
        this.status = status;
        return this;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public RescheduleRequest setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public RescheduleRequest setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public RescheduleRequest setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = RescheduleRequestStatus.PENDING;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RescheduleRequest that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}