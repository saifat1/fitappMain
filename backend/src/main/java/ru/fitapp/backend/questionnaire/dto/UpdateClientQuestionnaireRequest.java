package ru.fitapp.backend.questionnaire.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class UpdateClientQuestionnaireRequest {

    private Integer heightCm;
    private BigDecimal weightKg;

    @Size(max = 50)
    private String clothingSize;

    private BigDecimal bodyFatPercent;

    private List<String> healthConditions;

    @Size(max = 500)
    private String therapyType;

    private List<String> trainingExperience;

    @Min(1)
    @Max(7)
    private Integer trainingsPerWeek;

    private List<String> fitnessGoals;

    @Size(max = 255)
    private String fitnessGoalOther;

    @DecimalMin(value = "0", inclusive = false)
    private BigDecimal desiredWeightKg;

    private List<String> priorityBodyParts;

    private List<String> convenientDays;
    private List<String> convenientTimeOfDay;

    @Size(max = 255)
    private String convenientTimeNote;

    @Size(max = 2000)
    private String nutritionRecommendations;

    @Size(max = 2000)
    private String instructorNotes;

    public Integer getHeightCm() {
        return heightCm;
    }

    public UpdateClientQuestionnaireRequest setHeightCm(Integer heightCm) {
        this.heightCm = heightCm;
        return this;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public UpdateClientQuestionnaireRequest setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
        return this;
    }

    public String getClothingSize() {
        return clothingSize;
    }

    public UpdateClientQuestionnaireRequest setClothingSize(String clothingSize) {
        this.clothingSize = clothingSize;
        return this;
    }

    public BigDecimal getBodyFatPercent() {
        return bodyFatPercent;
    }

    public UpdateClientQuestionnaireRequest setBodyFatPercent(BigDecimal bodyFatPercent) {
        this.bodyFatPercent = bodyFatPercent;
        return this;
    }

    public List<String> getHealthConditions() {
        return healthConditions;
    }

    public UpdateClientQuestionnaireRequest setHealthConditions(List<String> healthConditions) {
        this.healthConditions = healthConditions;
        return this;
    }

    public String getTherapyType() {
        return therapyType;
    }

    public UpdateClientQuestionnaireRequest setTherapyType(String therapyType) {
        this.therapyType = therapyType;
        return this;
    }

    public List<String> getTrainingExperience() {
        return trainingExperience;
    }

    public UpdateClientQuestionnaireRequest setTrainingExperience(List<String> trainingExperience) {
        this.trainingExperience = trainingExperience;
        return this;
    }

    public Integer getTrainingsPerWeek() {
        return trainingsPerWeek;
    }

    public UpdateClientQuestionnaireRequest setTrainingsPerWeek(Integer trainingsPerWeek) {
        this.trainingsPerWeek = trainingsPerWeek;
        return this;
    }

    public List<String> getFitnessGoals() {
        return fitnessGoals;
    }

    public UpdateClientQuestionnaireRequest setFitnessGoals(List<String> fitnessGoals) {
        this.fitnessGoals = fitnessGoals;
        return this;
    }

    public String getFitnessGoalOther() {
        return fitnessGoalOther;
    }

    public UpdateClientQuestionnaireRequest setFitnessGoalOther(String fitnessGoalOther) {
        this.fitnessGoalOther = fitnessGoalOther;
        return this;
    }

    public BigDecimal getDesiredWeightKg() {
        return desiredWeightKg;
    }

    public UpdateClientQuestionnaireRequest setDesiredWeightKg(BigDecimal desiredWeightKg) {
        this.desiredWeightKg = desiredWeightKg;
        return this;
    }

    public List<String> getPriorityBodyParts() {
        return priorityBodyParts;
    }

    public UpdateClientQuestionnaireRequest setPriorityBodyParts(List<String> priorityBodyParts) {
        this.priorityBodyParts = priorityBodyParts;
        return this;
    }

    public List<String> getConvenientDays() {
        return convenientDays;
    }

    public UpdateClientQuestionnaireRequest setConvenientDays(List<String> convenientDays) {
        this.convenientDays = convenientDays;
        return this;
    }

    public List<String> getConvenientTimeOfDay() {
        return convenientTimeOfDay;
    }

    public UpdateClientQuestionnaireRequest setConvenientTimeOfDay(List<String> convenientTimeOfDay) {
        this.convenientTimeOfDay = convenientTimeOfDay;
        return this;
    }

    public String getConvenientTimeNote() {
        return convenientTimeNote;
    }

    public UpdateClientQuestionnaireRequest setConvenientTimeNote(String convenientTimeNote) {
        this.convenientTimeNote = convenientTimeNote;
        return this;
    }

    public String getNutritionRecommendations() {
        return nutritionRecommendations;
    }

    public UpdateClientQuestionnaireRequest setNutritionRecommendations(String nutritionRecommendations) {
        this.nutritionRecommendations = nutritionRecommendations;
        return this;
    }

    public String getInstructorNotes() {
        return instructorNotes;
    }

    public UpdateClientQuestionnaireRequest setInstructorNotes(String instructorNotes) {
        this.instructorNotes = instructorNotes;
        return this;
    }
}
