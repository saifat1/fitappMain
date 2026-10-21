package ru.fitapp.backend.availability.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@Table(name = "trainer_availability_exception")
public class TrainerAvailabilityException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_trainer_availability_exception_trainer")
    )
    private AppUser trainer;

    @Column(name = "exception_date", nullable = false)
    private LocalDate exceptionDate;

    /** Last day of a multi-day closure (vacation); null means a single day. The start/end time applies to every day. */
    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "comment")
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public TrainerAvailabilityException setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public TrainerAvailabilityException setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public LocalDate getExceptionDate() {
        return exceptionDate;
    }

    public TrainerAvailabilityException setExceptionDate(LocalDate exceptionDate) {
        this.exceptionDate = exceptionDate;
        return this;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public TrainerAvailabilityException setEndDate(LocalDate endDate) {
        this.endDate = endDate;
        return this;
    }

    /** endDate, or exceptionDate for a single-day exception. */
    public LocalDate getLastDate() {
        return endDate != null ? endDate : exceptionDate;
    }

    public boolean coversDate(LocalDate date) {
        return !date.isBefore(exceptionDate) && !date.isAfter(getLastDate());
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerAvailabilityException setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerAvailabilityException setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public String getComment() {
        return comment;
    }

    public TrainerAvailabilityException setComment(String comment) {
        this.comment = comment;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public TrainerAvailabilityException setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public TrainerAvailabilityException setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TrainerAvailabilityException that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}