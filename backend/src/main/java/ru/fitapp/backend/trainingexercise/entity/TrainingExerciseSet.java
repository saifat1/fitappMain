package ru.fitapp.backend.trainingexercise.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "training_exercise_set")
public class TrainingExerciseSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "training_exercise_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_training_exercise_set_exercise")
    )
    private TrainingExercise exercise;

    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    @Column(name = "reps")
    private Integer reps;

    @Column(name = "weight", precision = 10, scale = 2)
    private BigDecimal weight;

    public TrainingExerciseSet() {
    }

    public Long getId() {
        return id;
    }

    public TrainingExerciseSet setId(Long id) {
        this.id = id;
        return this;
    }

    public TrainingExercise getExercise() {
        return exercise;
    }

    public TrainingExerciseSet setExercise(TrainingExercise exercise) {
        this.exercise = exercise;
        return this;
    }

    public Integer getSetNumber() {
        return setNumber;
    }

    public TrainingExerciseSet setSetNumber(Integer setNumber) {
        this.setNumber = setNumber;
        return this;
    }

    public Integer getReps() {
        return reps;
    }

    public TrainingExerciseSet setReps(Integer reps) {
        this.reps = reps;
        return this;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public TrainingExerciseSet setWeight(BigDecimal weight) {
        this.weight = weight;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TrainingExerciseSet that)) return false;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
