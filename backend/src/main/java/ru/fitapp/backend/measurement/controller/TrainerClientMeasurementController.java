package ru.fitapp.backend.measurement.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.measurement.dto.ClientMeasurementResponse;
import ru.fitapp.backend.measurement.dto.SaveClientMeasurementRequest;
import ru.fitapp.backend.measurement.service.ClientMeasurementService;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/clients/{clientId}/measurements")
public class TrainerClientMeasurementController {

    private final ClientMeasurementService clientMeasurementService;
    private final TrainerClientService trainerClientService;
    private final CurrentUserService currentUserService;

    public TrainerClientMeasurementController(
            ClientMeasurementService clientMeasurementService,
            TrainerClientService trainerClientService,
            CurrentUserService currentUserService
    ) {
        this.clientMeasurementService = clientMeasurementService;
        this.trainerClientService = trainerClientService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<ClientMeasurementResponse> getAll(@PathVariable Long clientId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return clientMeasurementService.getForClient(clientId);
    }

    @PostMapping
    public ClientMeasurementResponse create(
            @PathVariable Long clientId,
            @Valid @RequestBody SaveClientMeasurementRequest request
    ) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        AppUser client = trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return clientMeasurementService.create(trainer, client, request);
    }

    @PutMapping("/{measurementId}")
    public ClientMeasurementResponse update(
            @PathVariable Long clientId,
            @PathVariable Long measurementId,
            @Valid @RequestBody SaveClientMeasurementRequest request
    ) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return clientMeasurementService.update(measurementId, clientId, request);
    }

    @DeleteMapping("/{measurementId}")
    public void delete(@PathVariable Long clientId, @PathVariable Long measurementId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        clientMeasurementService.delete(measurementId, clientId);
    }
}
