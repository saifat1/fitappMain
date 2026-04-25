package ru.fitapp.backend.trainingexercise.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.common.model.RepsMode;
import ru.fitapp.backend.training.entity.Training;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "training_exercise")
public class TrainingExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "training_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_training_exercise_training")
    )
    private Training training;

    @Column(name = "order_num", nullable = false)
    private Integer orderNum;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "sets")
    private Integer sets;

    @Enumerated(EnumType.STRING)
    @Column(name = "reps_mode", nullable = false, length = 16)
    private RepsMode repsMode;

    @Column(name = "reps_value")
    private Integer repsValue;

    @Column(name = "reps_from")
    private Integer repsFrom;

    @Column(name = "reps_to")
    private Integer repsTo;

    @Column(name = "weight", precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "rest_seconds")
    private Integer restSeconds;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted;

    @Column(name = "trainer_note", length = 2000)
    private String trainerNote;

    @Column(name = "client_note", length = 2000)
    private String clientNote;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public TrainingExercise() {
    }

    public Long getId() {
        return id;
    }

    public TrainingExercise setId(Long id) {
        this.id = id;
        return this;
    }

    public Training getTraining() {
        return training;
    }

    public TrainingExercise setTraining(Training training) {
        this.training = training;
        return this;
    }

    public Integer getOrderNum() {
        return orderNum;
    }

    public TrainingExercise setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public TrainingExercise setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public TrainingExercise setDescription(String description) {
        this.description = description;
        return this;
    }

    public Integer getSets() {
        return sets;
    }

    public TrainingExercise setSets(Integer sets) {
        this.sets = sets;
        return this;
    }

    public RepsMode getRepsMode() {
        return repsMode;
    }

    public TrainingExercise setRepsMode(RepsMode repsMode) {
        this.repsMode = repsMode;
        return this;
    }

    public Integer getRepsValue() {
        return repsValue;
    }

    public TrainingExercise setRepsValue(Integer repsValue) {
        this.repsValue = repsValue;
        return this;
    }

    public Integer getRepsFrom() {
        return repsFrom;
    }

    public TrainingExercise setRepsFrom(Integer repsFrom) {
        this.repsFrom = repsFrom;
        return this;
    }

    public Integer getRepsTo() {
        return repsTo;
    }

    public TrainingExercise setRepsTo(Integer repsTo) {
        this.repsTo = repsTo;
        return this;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public TrainingExercise setWeight(BigDecimal weight) {
        this.weight = weight;
        return this;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public TrainingExercise setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
        return this;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public TrainingExercise setRestSeconds(Integer restSeconds) {
        this.restSeconds = restSeconds;
        return this;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public TrainingExercise setIsCompleted(Boolean completed) {
        isCompleted = completed;
        return this;
    }

    public String getTrainerNote() {
        return trainerNote;
    }

    public TrainingExercise setTrainerNote(String trainerNote) {
        this.trainerNote = trainerNote;
        return this;
    }

    public String getClientNote() {
        return clientNote;
    }

    public TrainingExercise setClientNote(String clientNote) {
        this.clientNote = clientNote;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public TrainingExercise setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public TrainingExercise setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.isCompleted == null) {
            this.isCompleted = false;
        }

        if (this.repsMode == null) {
            this.repsMode = RepsMode.NONE;
        }
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TrainingExercise that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}