package ru.fitapp.backend.measurement.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * One measurement session ("замер") for a client, taken on a given date.
 * Mirrors the rows of the paper "Таблица измерений" — but transposed: each
 * row here is one date's worth of values, rather than one metric's column
 * across dates. This is what lets the UI compare "this session vs the
 * previous one" per metric.
 */
@Entity
@Table(name = "client_measurement")
public class ClientMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_client_measurement_client")
    )
    private AppUser client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_client_measurement_trainer")
    )
    private AppUser trainer;

    @Column(name = "measured_at", nullable = false)
    private LocalDate measuredAt;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "neck_cm", precision = 5, scale = 2)
    private BigDecimal neckCm;

    @Column(name = "chest_cm", precision = 5, scale = 2)
    private BigDecimal chestCm;

    @Column(name = "waist_cm", precision = 5, scale = 2)
    private BigDecimal waistCm;

    @Column(name = "hips_cm", precision = 5, scale = 2)
    private BigDecimal hipsCm;

    @Column(name = "biceps_right_cm", precision = 5, scale = 2)
    private BigDecimal bicepsRightCm;

    @Column(name = "biceps_left_cm", precision = 5, scale = 2)
    private BigDecimal bicepsLeftCm;

    @Column(name = "forearm_cm", precision = 5, scale = 2)
    private BigDecimal forearmCm;

    @Column(name = "thigh_cm", precision = 5, scale = 2)
    private BigDecimal thighCm;

    @Column(name = "calf_right_cm", precision = 5, scale = 2)
    private BigDecimal calfRightCm;

    @Column(name = "calf_left_cm", precision = 5, scale = 2)
    private BigDecimal calfLeftCm;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public ClientMeasurement setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getClient() {
        return client;
    }

    public ClientMeasurement setClient(AppUser client) {
        this.client = client;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public ClientMeasurement setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public LocalDate getMeasuredAt() {
        return measuredAt;
    }

    public ClientMeasurement setMeasuredAt(LocalDate measuredAt) {
        this.measuredAt = measuredAt;
        return this;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public ClientMeasurement setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
        return this;
    }

    public BigDecimal getNeckCm() {
        return neckCm;
    }

    public ClientMeasurement setNeckCm(BigDecimal neckCm) {
        this.neckCm = neckCm;
        return this;
    }

    public BigDecimal getChestCm() {
        return chestCm;
    }

    public ClientMeasurement setChestCm(BigDecimal chestCm) {
        this.chestCm = chestCm;
        return this;
    }

    public BigDecimal getWaistCm() {
        return waistCm;
    }

    public ClientMeasurement setWaistCm(BigDecimal waistCm) {
        this.waistCm = waistCm;
        return this;
    }

    public BigDecimal getHipsCm() {
        return hipsCm;
    }

    public ClientMeasurement setHipsCm(BigDecimal hipsCm) {
        this.hipsCm = hipsCm;
        return this;
    }

    public BigDecimal getBicepsRightCm() {
        return bicepsRightCm;
    }

    public ClientMeasurement setBicepsRightCm(BigDecimal bicepsRightCm) {
        this.bicepsRightCm = bicepsRightCm;
        return this;
    }

    public BigDecimal getBicepsLeftCm() {
        return bicepsLeftCm;
    }

    public ClientMeasurement setBicepsLeftCm(BigDecimal bicepsLeftCm) {
        this.bicepsLeftCm = bicepsLeftCm;
        return this;
    }

    public BigDecimal getForearmCm() {
        return forearmCm;
    }

    public ClientMeasurement setForearmCm(BigDecimal forearmCm) {
        this.forearmCm = forearmCm;
        return this;
    }

    public BigDecimal getThighCm() {
        return thighCm;
    }

    public ClientMeasurement setThighCm(BigDecimal thighCm) {
        this.thighCm = thighCm;
        return this;
    }

    public BigDecimal getCalfRightCm() {
        return calfRightCm;
    }

    public ClientMeasurement setCalfRightCm(BigDecimal calfRightCm) {
        this.calfRightCm = calfRightCm;
        return this;
    }

    public BigDecimal getCalfLeftCm() {
        return calfLeftCm;
    }

    public ClientMeasurement setCalfLeftCm(BigDecimal calfLeftCm) {
        this.calfLeftCm = calfLeftCm;
        return this;
    }

    public String getNotes() {
        return notes;
    }

    public ClientMeasurement setNotes(String notes) {
        this.notes = notes;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public ClientMeasurement setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ClientMeasurement that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
