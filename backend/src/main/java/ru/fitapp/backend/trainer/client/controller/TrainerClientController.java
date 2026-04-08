package ru.fitapp.backend.trainer.client.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.trainer.client.dto.TrainerClientResponse;
import ru.fitapp.backend.trainer.client.dto.UpdateTrainerClientRequest;
import ru.fitapp.backend.trainer.client.service.TrainerClientFacadeService;

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

    @PutMapping("/{clientId}")
    public TrainerClientResponse updateCurrentTrainerClient(@PathVariable Long clientId,
                                                            @Valid @RequestBody UpdateTrainerClientRequest request) {
        return trainerClientFacadeService.updateCurrentTrainerClient(clientId, request);
    }

    @DeleteMapping("/{clientId}")
    public void deactivateCurrentTrainerClient(@PathVariable Long clientId) {
        trainerClientFacadeService.deactivateCurrentTrainerClient(clientId);
    }
}