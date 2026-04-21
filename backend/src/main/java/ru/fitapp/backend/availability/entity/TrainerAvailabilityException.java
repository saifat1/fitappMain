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