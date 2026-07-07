package ru.fitapp.backend.questionnaire.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.questionnaire.dto.ClientQuestionnaireResponse;
import ru.fitapp.backend.questionnaire.dto.UpdateClientQuestionnaireRequest;
import ru.fitapp.backend.questionnaire.service.ClientQuestionnaireService;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;

@RestController
@RequestMapping("/api/trainer/clients/{clientId}/questionnaire")
public class TrainerClientQuestionnaireController {

    private final ClientQuestionnaireService clientQuestionnaireService;
    private final TrainerClientService trainerClientService;
    private final CurrentUserService currentUserService;

    public TrainerClientQuestionnaireController(
            ClientQuestionnaireService clientQuestionnaireService,
            TrainerClientService trainerClientService,
            CurrentUserService currentUserService
    ) {
        this.clientQuestionnaireService = clientQuestionnaireService;
        this.trainerClientService = trainerClientService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ClientQuestionnaireResponse get(@PathVariable Long clientId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return clientQuestionnaireService.getForClient(clientId);
    }

    @PutMapping
    public ClientQuestionnaireResponse update(
            @PathVariable Long clientId,
            @Valid @RequestBody UpdateClientQuestionnaireRequest request
    ) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        AppUser client = trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return clientQuestionnaireService.upsert(trainer, client, request);
    }
}
