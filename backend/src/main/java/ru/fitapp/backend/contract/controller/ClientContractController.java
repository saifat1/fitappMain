package ru.fitapp.backend.contract.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.contract.dto.AddTrainingsToContractRequest;
import ru.fitapp.backend.contract.dto.ClientContractResponse;
import ru.fitapp.backend.contract.dto.CreateClientContractRequest;
import ru.fitapp.backend.contract.service.ClientContractService;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/clients/{clientId}/contracts")
public class ClientContractController {

    private final ClientContractService clientContractService;
    private final TrainerClientService trainerClientService;
    private final CurrentUserService currentUserService;

    public ClientContractController(
            ClientContractService clientContractService,
            TrainerClientService trainerClientService,
            CurrentUserService currentUserService
    ) {
        this.clientContractService = clientContractService;
        this.trainerClientService = trainerClientService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<ClientContractResponse> getContracts(@PathVariable Long clientId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return clientContractService.getContracts(clientId, trainer.getId());
    }

    @PostMapping
    public ClientContractResponse createContract(
            @PathVariable Long clientId,
            @Valid @RequestBody CreateClientContractRequest request
    ) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        AppUser client = trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return clientContractService.createContract(trainer, client, request);
    }

    @PostMapping("/{contractId}/add-trainings")
    public ClientContractResponse addTrainings(
            @PathVariable Long clientId,
            @PathVariable Long contractId,
            @Valid @RequestBody AddTrainingsToContractRequest request
    ) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return clientContractService.addTrainings(contractId, clientId, trainer.getId(), request);
    }
}
