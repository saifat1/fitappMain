package ru.fitapp.backend.measurement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SaveClientMeasurementRequest {

    @NotNull(message = "Укажите дату замера")
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

    @Size(max = 1000)
    private String notes;

    public LocalDate getMeasuredAt() {
        return measuredAt;
    }

    public SaveClientMeasurementRequest setMeasuredAt(LocalDate measuredAt) {
        this.measuredAt = measuredAt;
        return this;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public SaveClientMeasurementRequest setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
        return this;
    }

    public BigDecimal getNeckCm() {
        return neckCm;
    }

    public SaveClientMeasurementRequest setNeckCm(BigDecimal neckCm) {
        this.neckCm = neckCm;
        return this;
    }

    public BigDecimal getChestCm() {
        return chestCm;
    }

    public SaveClientMeasurementRequest setChestCm(BigDecimal chestCm) {
        this.chestCm = chestCm;
        return this;
    }

    public BigDecimal getWaistCm() {
        return waistCm;
    }

    public SaveClientMeasurementRequest setWaistCm(BigDecimal waistCm) {
        this.waistCm = waistCm;
        return this;
    }

    public BigDecimal getHipsCm() {
        return hipsCm;
    }

    public SaveClientMeasurementRequest setHipsCm(BigDecimal hipsCm) {
        this.hipsCm = hipsCm;
        return this;
    }

    public BigDecimal getBicepsRightCm() {
        return bicepsRightCm;
    }

    public SaveClientMeasurementRequest setBicepsRightCm(BigDecimal bicepsRightCm) {
        this.bicepsRightCm = bicepsRightCm;
        return this;
    }

    public BigDecimal getBicepsLeftCm() {
        return bicepsLeftCm;
    }

    public SaveClientMeasurementRequest setBicepsLeftCm(BigDecimal bicepsLeftCm) {
        this.bicepsLeftCm = bicepsLeftCm;
        return this;
    }

    public BigDecimal getForearmCm() {
        return forearmCm;
    }

    public SaveClientMeasurementRequest setForearmCm(BigDecimal forearmCm) {
        this.forearmCm = forearmCm;
        return this;
    }

    public BigDecimal getThighCm() {
        return thighCm;
    }

    public SaveClientMeasurementRequest setThighCm(BigDecimal thighCm) {
        this.thighCm = thighCm;
        return this;
    }

    public BigDecimal getCalfRightCm() {
        return calfRightCm;
    }

    public SaveClientMeasurementRequest setCalfRightCm(BigDecimal calfRightCm) {
        this.calfRightCm = calfRightCm;
        return this;
    }

    public BigDecimal getCalfLeftCm() {
        return calfLeftCm;
    }

    public SaveClientMeasurementRequest setCalfLeftCm(BigDecimal calfLeftCm) {
        this.calfLeftCm = calfLeftCm;
        return this;
    }

    public String getNotes() {
        return notes;
    }

    public SaveClientMeasurementRequest setNotes(String notes) {
        this.notes = notes;
        return this;
    }
}
