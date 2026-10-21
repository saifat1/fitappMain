package ru.fitapp.backend.trainingexercise.entity;

import jakarta.persistence.*;

import java.util.Objects;

/** Free-form field of a circuit-training station: a text note or a timer ("секундомер"), in display order. */
@Entity
@Table(name = "training_exercise_field")
public class TrainingExerciseField {

    public enum Type { TEXT, TIMER }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "training_exercise_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_training_exercise_field_exercise")
    )
    private TrainingExercise exercise;

    @Column(name = "position", nullable = false)
    private Integer position;

    @Enumerated(EnumType.STRING)
    @Column(name = "field_type", nullable = false, length = 16)
    private Type type;

    @Column(name = "text_value", length = 2000)
    private String textValue;

    @Column(name = "seconds")
    private Integer seconds;

    public Long getId() {
        return id;
    }

    public TrainingExercise getExercise() {
        return exercise;
    }

    public TrainingExerciseField setExercise(TrainingExercise exercise) {
        this.exercise = exercise;
        return this;
    }

    public Integer getPosition() {
        return position;
    }

    public TrainingExerciseField setPosition(Integer position) {
        this.position = position;
        return this;
    }

    public Type getType() {
        return type;
    }

    public TrainingExerciseField setType(Type type) {
        this.type = type;
        return this;
    }

    public String getTextValue() {
        return textValue;
    }

    public TrainingExerciseField setTextValue(String textValue) {
        this.textValue = textValue;
        return this;
    }

    public Integer getSeconds() {
        return seconds;
    }

    public TrainingExerciseField setSeconds(Integer seconds) {
        this.seconds = seconds;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TrainingExerciseField that)) return false;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
