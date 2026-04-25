package ru.fitapp.backend.trainer.client.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.trainer.client.dto.CreateManualTrainerClientRequest;
import ru.fitapp.backend.trainer.client.dto.CreateTrainerClientInviteRequest;
import ru.fitapp.backend.trainer.client.dto.TrainerClientResponse;
import ru.fitapp.backend.trainer.client.dto.UpdateTrainerClientRequest;
import ru.fitapp.backend.trainer.client.service.TrainerClientFacadeService;
import ru.fitapp.backend.trainer.invite.dto.InviteResponse;
import ru.fitapp.backend.trainer.client.dto.ClientHistoryResponse;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/clients")
public class TrainerClientController {

    private final TrainerClientFacadeService trainerClientFacadeService;

    public TrainerClientController(TrainerClientFacadeService trainerClientFacadeService) {
        this.trainerClientFacadeService = trainerClientFacadeService;
    }

    @GetMapping
    public List<TrainerClientResponse> getCurrentTrainerClients() {
        return trainerClientFacadeService.getCurrentTrainerClients();
    }

    @GetMapping("/{clientId}")
    public TrainerClientResponse getCurrentTrainerClient(@PathVariable Long clientId) {
        return trainerClientFacadeService.getCurrentTrainerClient(clientId);
    }

    @PostMapping("/manual")
    @ResponseStatus(HttpStatus.CREATED)
    public TrainerClientResponse createCurrentTrainerClient(
            @Valid @RequestBody CreateManualTrainerClientRequest request
    ) {
        return trainerClientFacadeService.createCurrentTrainerClient(request);
    }

    @PostMapping("/{clientId}/invite")
    public InviteResponse createInviteForCurrentTrainerClient(
            @PathVariable Long clientId,
            @Valid @RequestBody(required = false) CreateTrainerClientInviteRequest request
    ) {
        return trainerClientFacadeService.createInviteForCurrentTrainerClient(clientId, request);
    }

    @PutMapping("/{clientId}")
    public TrainerClientResponse updateCurrentTrainerClient(
            @PathVariable Long clientId,
            @Valid @RequestBody UpdateTrainerClientRequest request
    ) {
        return trainerClientFacadeService.updateCurrentTrainerClient(clientId, request);
    }

    @DeleteMapping("/{clientId}")
    public void deactivateCurrentTrainerClient(@PathVariable Long clientId) {
        trainerClientFacadeService.deactivateCurrentTrainerClient(clientId);
    }

    @GetMapping("/{clientId}/history")
    public ClientHistoryResponse getCurrentTrainerClientHistory(@PathVariable Long clientId) {
        return trainerClientFacadeService.getCurrentTrainerClientHistory(clientId);
    }

}