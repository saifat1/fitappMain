package ru.fitapp.backend.questionnaire.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ClientQuestionnaireResponse {

    private boolean filled;
    private Integer heightCm;
    private BigDecimal weightKg;
    private String clothingSize;
    private BigDecimal bodyFatPercent;

    private List<String> healthConditions;
    private String therapyType;

    private List<String> trainingExperience;
    private Integer trainingsPerWeek;

    private List<String> fitnessGoals;
    private String fitnessGoalOther;
    private BigDecimal desiredWeightKg;

    private List<String> priorityBodyParts;

    private List<String> convenientDays;
    private List<String> convenientTimeOfDay;
    private String convenientTimeNote;

    private String nutritionRecommendations;
    private String instructorNotes;

    private LocalDateTime updatedAt;

    public boolean isFilled() {
        return filled;
    }

    public ClientQuestionnaireResponse setFilled(boolean filled) {
        this.filled = filled;
        return this;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public ClientQuestionnaireResponse setHeightCm(Integer heightCm) {
        this.heightCm = heightCm;
        return this;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public ClientQuestionnaireResponse setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
        return this;
    }

    public String getClothingSize() {
        return clothingSize;
    }

    public ClientQuestionnaireResponse setClothingSize(String clothingSize) {
        this.clothingSize = clothingSize;
        return this;
    }

    public BigDecimal getBodyFatPercent() {
        return bodyFatPercent;
    }

    public ClientQuestionnaireResponse setBodyFatPercent(BigDecimal bodyFatPercent) {
        this.bodyFatPercent = bodyFatPercent;
        return this;
    }

    public List<String> getHealthConditions() {
        return healthConditions;
    }

    public ClientQuestionnaireResponse setHealthConditions(List<String> healthConditions) {
        this.healthConditions = healthConditions;
        return this;
    }

    public String getTherapyType() {
        return therapyType;
    }

    public ClientQuestionnaireResponse setTherapyType(String therapyType) {
        this.therapyType = therapyType;
        return this;
    }

    public List<String> getTrainingExperience() {
        return trainingExperience;
    }

    public ClientQuestionnaireResponse setTrainingExperience(List<String> trainingExperience) {
        this.trainingExperience = trainingExperience;
        return this;
    }

    public Integer getTrainingsPerWeek() {
        return trainingsPerWeek;
    }

    public ClientQuestionnaireResponse setTrainingsPerWeek(Integer trainingsPerWeek) {
        this.trainingsPerWeek = trainingsPerWeek;
        return this;
    }

    public List<String> getFitnessGoals() {
        return fitnessGoals;
    }

    public ClientQuestionnaireResponse setFitnessGoals(List<String> fitnessGoals) {
        this.fitnessGoals = fitnessGoals;
        return this;
    }

    public String getFitnessGoalOther() {
        return fitnessGoalOther;
    }

    public ClientQuestionnaireResponse setFitnessGoalOther(String fitnessGoalOther) {
        this.fitnessGoalOther = fitnessGoalOther;
        return this;
    }

    public BigDecimal getDesiredWeightKg() {
        return desiredWeightKg;
    }

    public ClientQuestionnaireResponse setDesiredWeightKg(BigDecimal desiredWeightKg) {
        this.desiredWeightKg = desiredWeightKg;
        return this;
    }

    public List<String> getPriorityBodyParts() {
        return priorityBodyParts;
    }

    public ClientQuestionnaireResponse setPriorityBodyParts(List<String> priorityBodyParts) {
        this.priorityBodyParts = priorityBodyParts;
        return this;
    }

    public List<String> getConvenientDays() {
        return convenientDays;
    }

    public ClientQuestionnaireResponse setConvenientDays(List<String> convenientDays) {
        this.convenientDays = convenientDays;
        return this;
    }

    public List<String> getConvenientTimeOfDay() {
        return convenientTimeOfDay;
    }

    public ClientQuestionnaireResponse setConvenientTimeOfDay(List<String> convenientTimeOfDay) {
        this.convenientTimeOfDay = convenientTimeOfDay;
        return this;
    }

    public String getConvenientTimeNote() {
        return convenientTimeNote;
    }

    public ClientQuestionnaireResponse setConvenientTimeNote(String convenientTimeNote) {
        this.convenientTimeNote = convenientTimeNote;
        return this;
    }

    public String getNutritionRecommendations() {
        return nutritionRecommendations;
    }

    public ClientQuestionnaireResponse setNutritionRecommendations(String nutritionRecommendations) {
        this.nutritionRecommendations = nutritionRecommendations;
        return this;
    }

    public String getInstructorNotes() {
        return instructorNotes;
    }

    public ClientQuestionnaireResponse setInstructorNotes(String instructorNotes) {
        this.instructorNotes = instructorNotes;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public ClientQuestionnaireResponse setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }
}
