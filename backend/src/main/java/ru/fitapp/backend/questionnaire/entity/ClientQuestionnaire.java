package ru.fitapp.backend.questionnaire.entity;

import jakarta.persistence.*;
import ru.fitapp.backend.user.entity.AppUser;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * "Анкета ВТ" — a single editable intake document per client (fixed at one
 * per client, per the 07.07.2026 decision — no version history). Checklist
 * groups (health conditions, training experience, fitness goals, priority
 * body parts, convenient days/time) are stored as comma-joined fixed codes
 * rather than separate join tables, since the option sets are small and
 * fixed on both frontend and backend.
 */
@Entity
@Table(name = "client_questionnaire")
public class ClientQuestionnaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "client_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_client_questionnaire_client")
    )
    private AppUser client;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "trainer_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_client_questionnaire_trainer")
    )
    private AppUser trainer;

    @Column(name = "height_cm")
    private Integer heightCm;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "clothing_size", length = 50)
    private String clothingSize;

    @Column(name = "body_fat_percent", precision = 5, scale = 2)
    private BigDecimal bodyFatPercent;

    @Column(name = "health_conditions", length = 1000)
    private String healthConditions;

    @Column(name = "therapy_type", length = 500)
    private String therapyType;

    @Column(name = "training_experience", length = 500)
    private String trainingExperience;

    @Column(name = "trainings_per_week")
    private Integer trainingsPerWeek;

    @Column(name = "fitness_goals", length = 500)
    private String fitnessGoals;

    @Column(name = "fitness_goal_other", length = 255)
    private String fitnessGoalOther;

    @Column(name = "desired_weight_kg", precision = 5, scale = 2)
    private BigDecimal desiredWeightKg;

    @Column(name = "priority_body_parts", length = 500)
    private String priorityBodyParts;

    @Column(name = "convenient_days", length = 255)
    private String convenientDays;

    @Column(name = "convenient_time_of_day", length = 255)
    private String convenientTimeOfDay;

    @Column(name = "convenient_time_note", length = 255)
    private String convenientTimeNote;

    @Column(name = "nutrition_recommendations", length = 2000)
    private String nutritionRecommendations;

    @Column(name = "instructor_notes", length = 2000)
    private String instructorNotes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public ClientQuestionnaire setId(Long id) {
        this.id = id;
        return this;
    }

    public AppUser getClient() {
        return client;
    }

    public ClientQuestionnaire setClient(AppUser client) {
        this.client = client;
        return this;
    }

    public AppUser getTrainer() {
        return trainer;
    }

    public ClientQuestionnaire setTrainer(AppUser trainer) {
        this.trainer = trainer;
        return this;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public ClientQuestionnaire setHeightCm(Integer heightCm) {
        this.heightCm = heightCm;
        return this;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public ClientQuestionnaire setWeightKg(BigDecimal weightKg) {
        this.weightKg = weightKg;
        return this;
    }

    public String getClothingSize() {
        return clothingSize;
    }

    public ClientQuestionnaire setClothingSize(String clothingSize) {
        this.clothingSize = clothingSize;
        return this;
    }

    public BigDecimal getBodyFatPercent() {
        return bodyFatPercent;
    }

    public ClientQuestionnaire setBodyFatPercent(BigDecimal bodyFatPercent) {
        this.bodyFatPercent = bodyFatPercent;
        return this;
    }

    public String getHealthConditions() {
        return healthConditions;
    }

    public ClientQuestionnaire setHealthConditions(String healthConditions) {
        this.healthConditions = healthConditions;
        return this;
    }

    public String getTherapyType() {
        return therapyType;
    }

    public ClientQuestionnaire setTherapyType(String therapyType) {
        this.therapyType = therapyType;
        return this;
    }

    public String getTrainingExperience() {
        return trainingExperience;
    }

    public ClientQuestionnaire setTrainingExperience(String trainingExperience) {
        this.trainingExperience = trainingExperience;
        return this;
    }

    public Integer getTrainingsPerWeek() {
        return trainingsPerWeek;
    }

    public ClientQuestionnaire setTrainingsPerWeek(Integer trainingsPerWeek) {
        this.trainingsPerWeek = trainingsPerWeek;
        return this;
    }

    public String getFitnessGoals() {
        return fitnessGoals;
    }

    public ClientQuestionnaire setFitnessGoals(String fitnessGoals) {
        this.fitnessGoals = fitnessGoals;
        return this;
    }

    public String getFitnessGoalOther() {
        return fitnessGoalOther;
    }

    public ClientQuestionnaire setFitnessGoalOther(String fitnessGoalOther) {
        this.fitnessGoalOther = fitnessGoalOther;
        return this;
    }

    public BigDecimal getDesiredWeightKg() {
        return desiredWeightKg;
    }

    public ClientQuestionnaire setDesiredWeightKg(BigDecimal desiredWeightKg) {
        this.desiredWeightKg = desiredWeightKg;
        return this;
    }

    public String getPriorityBodyParts() {
        return priorityBodyParts;
    }

    public ClientQuestionnaire setPriorityBodyParts(String priorityBodyParts) {
        this.priorityBodyParts = priorityBodyParts;
        return this;
    }

    public String getConvenientDays() {
        return convenientDays;
    }

    public ClientQuestionnaire setConvenientDays(String convenientDays) {
        this.convenientDays = convenientDays;
        return this;
    }

    public String getConvenientTimeOfDay() {
        return convenientTimeOfDay;
    }

    public ClientQuestionnaire setConvenientTimeOfDay(String convenientTimeOfDay) {
        this.convenientTimeOfDay = convenientTimeOfDay;
        return this;
    }

    public String getConvenientTimeNote() {
        return convenientTimeNote;
    }

    public ClientQuestionnaire setConvenientTimeNote(String convenientTimeNote) {
        this.convenientTimeNote = convenientTimeNote;
        return this;
    }

    public String getNutritionRecommendations() {
        return nutritionRecommendations;
    }

    public ClientQuestionnaire setNutritionRecommendations(String nutritionRecommendations) {
        this.nutritionRecommendations = nutritionRecommendations;
        return this;
    }

    public String getInstructorNotes() {
        return instructorNotes;
    }

    public ClientQuestionnaire setInstructorNotes(String instructorNotes) {
        this.instructorNotes = instructorNotes;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public ClientQuestionnaire setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public ClientQuestionnaire setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ClientQuestionnaire that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
