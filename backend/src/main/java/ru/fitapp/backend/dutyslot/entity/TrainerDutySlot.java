package ru.fitapp.backend.dutyslot.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

@Entity
@Table(
        name = "trainer_duty_slot",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_trainer_duty_slot_trainer_date_start",
                        columnNames = {"trainer_id", "duty_date", "start_time"}
                )
        }
)
public class TrainerDutySlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_trainer_duty_slot_trainer")
    )
    private AppUser trainer;

    @Column(name = "duty_date", nullable = false)
    private LocalDate dutyDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public TrainerDutySlot setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public TrainerDutySlot setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public LocalDate getDutyDate() {
        return dutyDate;
    }

    public TrainerDutySlot setDutyDate(LocalDate dutyDate) {
        this.dutyDate = dutyDate;
        return this;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public TrainerDutySlot setStartTime(LocalTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public TrainerDutySlot setEndTime(LocalTime endTime) {
        this.endTime = endTime;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public TrainerDutySlot setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public TrainerDutySlot setUpdatedAt(LocalDateTime updatedAt) {
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
        if (!(o instanceof TrainerDutySlot that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}