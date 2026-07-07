package ru.fitapp.backend.measurement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ClientMeasurementResponse {

    private Long id;
    private LocalDate measuredAt;
    private BigDecimal weightKg;
    private BigDecimal neckCm;
    private BigDecimal chestCm;
    private BigDecimal waistCm;
    private BigDecimal hipsCm;
    private BigDecimal bicepsRightCm;
    private BigDecimal bicepsLeftCm;
    private BigDecimal forearmCm;
    private BigDecimal thighCm;
    private BigDecimal calfRightCm;
    private BigDecimal calfLeftCm;
    private String notes;

    public Long getId() {
        return id;
    }

    public ClientMeasurementResponse setId(Long id) {
        this.id = id;
        return this;
    }

    public LocalDate getMeasuredAt() {
        return measuredAt;
    }

    public ClientMeasurementResponse setMeasuredAt(LocalDate measuredAt) {
        this.measuredAt = measuredAt;
        return this;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public ClientMeasurementResponse setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
        return this;
    }

    public BigDecimal getNeckCm() {
        return neckCm;
    }

    public ClientMeasurementResponse setNeckCm(BigDecimal neckCm) {
        this.neckCm = neckCm;
        return this;
    }

    public BigDecimal getChestCm() {
        return chestCm;
    }

    public ClientMeasurementResponse setChestCm(BigDecimal chestCm) {
        this.chestCm = chestCm;
        return this;
    }

    public BigDecimal getWaistCm() {
        return waistCm;
    }

    public ClientMeasurementResponse setWaistCm(BigDecimal waistCm) {
        this.waistCm = waistCm;
        return this;
    }

    public BigDecimal getHipsCm() {
        return hipsCm;
    }

    public ClientMeasurementResponse setHipsCm(BigDecimal hipsCm) {
        this.hipsCm = hipsCm;
        return this;
    }

    public BigDecimal getBicepsRightCm() {
        return bicepsRightCm;
    }

    public ClientMeasurementResponse setBicepsRightCm(BigDecimal bicepsRightCm) {
        this.bicepsRightCm = bicepsRightCm;
        return this;
    }

    public BigDecimal getBicepsLeftCm() {
        return bicepsLeftCm;
    }

    public ClientMeasurementResponse setBicepsLeftCm(BigDecimal bicepsLeftCm) {
        this.bicepsLeftCm = bicepsLeftCm;
        return this;
    }

    public BigDecimal getForearmCm() {
        return forearmCm;
    }

    public ClientMeasurementResponse setForearmCm(BigDecimal forearmCm) {
        this.forearmCm = forearmCm;
        return this;
    }

    public BigDecimal getThighCm() {
        return thighCm;
    }

    public ClientMeasurementResponse setThighCm(BigDecimal thighCm) {
        this.thighCm = thighCm;
        return this;
    }

    public BigDecimal getCalfRightCm() {
        return calfRightCm;
    }

    public ClientMeasurementResponse setCalfRightCm(BigDecimal calfRightCm) {
        this.calfRightCm = calfRightCm;
        return this;
    }

    public BigDecimal getCalfLeftCm() {
        return calfLeftCm;
    }

    public ClientMeasurementResponse setCalfLeftCm(BigDecimal calfLeftCm) {
        this.calfLeftCm = calfLeftCm;
        return this;
    }

    public String getNotes() {
        return notes;
    }

    public ClientMeasurementResponse setNotes(String notes) {
        this.notes = notes;
        return this;
    }
}
