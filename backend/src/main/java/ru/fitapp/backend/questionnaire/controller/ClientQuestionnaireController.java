package ru.fitapp.backend.questionnaire.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.questionnaire.dto.ClientQuestionnaireResponse;
import ru.fitapp.backend.questionnaire.service.ClientQuestionnaireService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;

@RestController
@RequestMapping("/api/client/questionnaire")
public class ClientQuestionnaireController {

    private final ClientQuestionnaireService clientQuestionnaireService;
    private final CurrentUserService currentUserService;

    public ClientQuestionnaireController(
            ClientQuestionnaireService clientQuestionnaireService,
            CurrentUserService currentUserService
    ) {
        this.clientQuestionnaireService = clientQuestionnaireService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ClientQuestionnaireResponse getMyQuestionnaire() {
        AppUser client = currentUserService.getCurrentUser();
        if (client.getRole() != UserRole.CLIENT) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только клиенту");
        }
        return clientQuestionnaireService.getForClient(client.getId());
    }
}
