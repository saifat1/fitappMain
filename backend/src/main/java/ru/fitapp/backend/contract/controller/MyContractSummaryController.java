package ru.fitapp.backend.contract.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.contract.dto.ClientContractSummary;
import ru.fitapp.backend.contract.service.ClientContractService;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.trainerclient.entity.TrainerClient;
import ru.fitapp.backend.trainerclient.repository.TrainerClientRepository;
import ru.fitapp.backend.user.entity.AppUser;

/**
 * Contract balance as seen by the client himself — drives the balance card
 * on the client home screen. A client is linked to one trainer in practice;
 * if there are several, the first link wins.
 */
@RestController
@RequestMapping("/api/client/contract-summary")
public class MyContractSummaryController {

    private final ClientContractService clientContractService;
    private final TrainerClientRepository trainerClientRepository;
    private final CurrentUserService currentUserService;

    public MyContractSummaryController(
            ClientContractService clientContractService,
            TrainerClientRepository trainerClientRepository,
            CurrentUserService currentUserService
    ) {
        this.clientContractService = clientContractService;
        this.trainerClientRepository = trainerClientRepository;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ClientContractSummary getMySummary() {
        AppUser client = currentUserService.getCurrentUser();

        return trainerClientRepository.findAllByClientIdWithTrainer(client.getId())
                .stream()
                .findFirst()
                .map(TrainerClient::getTrainer)
                .map(trainer -> clientContractService.getSummary(client.getId(), trainer.getId()))
                .orElseGet(() -> new ClientContractSummary(false, 0, 0, 0));
    }
}
