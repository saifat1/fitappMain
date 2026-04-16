package ru.fitapp.backend.exercisetemplate.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "exercise_template")
public class ExerciseTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_exercise_template_trainer")
    )
    private AppUser trainer;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "sets")
    private Integer sets;

    @Column(name = "reps")
    private Integer reps;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "rest_seconds")
    private Integer restSeconds;

    @Column(name = "trainer_note", length = 2000)
    private String trainerNote;

    @Column(name = "is_archived", nullable = false)
    private Boolean isArchived;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ExerciseTemplate() {
    }

    public Long getId() {
        return id;
    }

    public ExerciseTemplate setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public ExerciseTemplate setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public String getName() {
        return name;
    }

    public ExerciseTemplate setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public ExerciseTemplate setDescription(String description) {
        this.description = description;
        return this;
    }

    public Integer getSets() {
        return sets;
    }

    public ExerciseTemplate setSets(Integer sets) {
        this.sets = sets;
        return this;
    }

    public Integer getReps() {
        return reps;
    }

    public ExerciseTemplate setReps(Integer reps) {
        this.reps = reps;
        return this;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public ExerciseTemplate setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public ExerciseTemplate setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public ExerciseTemplate setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }

    public Boolean getIsArchived() {
        return isArchived;
    }

    public ExerciseTemplate setIsArchived(Boolean archived) {
        isArchived = archived;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public ExerciseTemplate setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public ExerciseTemplate setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isArchived == null) {
            this.isArchived = false;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ExerciseTemplate that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}