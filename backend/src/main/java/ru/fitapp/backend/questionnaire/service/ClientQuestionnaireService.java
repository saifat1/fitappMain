package ru.fitapp.backend.questionnaire.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.questionnaire.dto.ClientQuestionnaireResponse;
import ru.fitapp.backend.questionnaire.dto.UpdateClientQuestionnaireRequest;
import ru.fitapp.backend.questionnaire.entity.ClientQuestionnaire;
import ru.fitapp.backend.questionnaire.repository.ClientQuestionnaireRepository;
import ru.fitapp.backend.user.entity.AppUser;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClientQuestionnaireService {

    private final ClientQuestionnaireRepository repository;

    public ClientQuestionnaireService(ClientQuestionnaireRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ClientQuestionnaireResponse getForClient(Long clientId) {
        return repository.findByClientId(clientId)
                .map(this::toResponse)
                .orElseGet(this::emptyResponse);
    }

    private ClientQuestionnaireResponse emptyResponse() {
        return new ClientQuestionnaireResponse()
                .setFilled(false)
                .setHealthConditions(List.of())
                .setTrainingExperience(List.of())
                .setFitnessGoals(List.of())
                .setPriorityBodyParts(List.of())
                .setConvenientDays(List.of())
                .setConvenientTimeOfDay(List.of());
    }

    public ClientQuestionnaireResponse upsert(AppUser trainer, AppUser client, UpdateClientQuestionnaireRequest request) {
        ClientQuestionnaire questionnaire = repository.findByClientId(client.getId())
                .orElseGet(() -> new ClientQuestionnaire().setClient(client).setTrainer(trainer));

        questionnaire
                .setHeightCm(request.getHeightCm())
                .setWeightKg(request.getWeightKg())
                .setClothingSize(request.getClothingSize())
                .setBodyFatPercent(request.getBodyFatPercent())
                .setHealthConditions(join(request.getHealthConditions()))
                .setTherapyType(request.getTherapyType())
                .setTrainingExperience(join(request.getTrainingExperience()))
                .setTrainingsPerWeek(request.getTrainingsPerWeek())
                .setFitnessGoals(join(request.getFitnessGoals()))
                .setFitnessGoalOther(request.getFitnessGoalOther())
                .setDesiredWeightKg(request.getDesiredWeightKg())
                .setPriorityBodyParts(join(request.getPriorityBodyParts()))
                .setConvenientDays(join(request.getConvenientDays()))
                .setConvenientTimeOfDay(join(request.getConvenientTimeOfDay()))
                .setConvenientTimeNote(request.getConvenientTimeNote())
                .setNutritionRecommendations(request.getNutritionRecommendations())
                .setInstructorNotes(request.getInstructorNotes());

        return toResponse(repository.save(questionnaire));
    }

    private String join(List<String> codes) {
        if (codes == null || codes.isEmpty()) return null;
        return String.join(",", codes);
    }

    private List<String> split(String value) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.stream(value.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    private ClientQuestionnaireResponse toResponse(ClientQuestionnaire q) {
        return new ClientQuestionnaireResponse()
                .setFilled(true)
                .setHeightCm(q.getHeightCm())
                .setWeightKg(q.getWeightKg())
                .setClothingSize(q.getClothingSize())
                .setBodyFatPercent(q.getBodyFatPercent())
                .setHealthConditions(split(q.getHealthConditions()))
                .setTherapyType(q.getTherapyType())
                .setTrainingExperience(split(q.getTrainingExperience()))
                .setTrainingsPerWeek(q.getTrainingsPerWeek())
                .setFitnessGoals(split(q.getFitnessGoals()))
                .setFitnessGoalOther(q.getFitnessGoalOther())
                .setDesiredWeightKg(q.getDesiredWeightKg())
                .setPriorityBodyParts(split(q.getPriorityBodyParts()))
                .setConvenientDays(split(q.getConvenientDays()))
                .setConvenientTimeOfDay(split(q.getConvenientTimeOfDay()))
                .setConvenientTimeNote(q.getConvenientTimeNote())
                .setNutritionRecommendations(q.getNutritionRecommendations())
                .setInstructorNotes(q.getInstructorNotes())
                .setUpdatedAt(q.getUpdatedAt());
    }
}
