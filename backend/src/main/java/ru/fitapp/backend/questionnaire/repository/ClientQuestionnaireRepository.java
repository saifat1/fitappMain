package ru.fitapp.backend.questionnaire.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.questionnaire.entity.ClientQuestionnaire;

import java.util.Optional;

public interface ClientQuestionnaireRepository extends JpaRepository<ClientQuestionnaire, Long> {
    Optional<ClientQuestionnaire> findByClientId(Long clientId);
}
