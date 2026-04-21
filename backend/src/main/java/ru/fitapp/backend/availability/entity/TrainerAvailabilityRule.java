package ru.fitapp.backend.availability.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@Table(name = "trainer_availability_rule")
public class TrainerAvailabilityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_trainer_availability_rule_trainer")
    )
    private AppUser trainer;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "slot_duration_minutes", nullable = false)
    private Integer slotDurationMinutes;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public TrainerAvailabilityRule setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public TrainerAvailabilityRule setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public Integer getDayOfWeek() {
        return dayOfWeek;
    }

    public TrainerAvailabilityRule setDayOfWeek(Integer dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerAvailabilityRule setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerAvailabilityRule setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public TrainerAvailabilityRule setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
        return this;
    }

    public boolean isActive() {
        return active;
    }

    public TrainerAvailabilityRule setActive(boolean active) {
        this.active = active;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public TrainerAvailabilityRule setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public TrainerAvailabilityRule setUpdatedAt(LocalDateTime updatedAt) {
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
        if (!(o instanceof TrainerAvailabilityRule that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
