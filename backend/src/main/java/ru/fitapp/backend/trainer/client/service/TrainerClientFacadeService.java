package ru.fitapp.backend.trainer.client.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.trainer.client.dto.TrainerClientResponse;
import ru.fitapp.backend.trainer.client.dto.UpdateTrainerClientRequest;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;

import java.util.List;

@Service
@Transactional
public class TrainerClientFacadeService {

    private final CurrentUserService currentUserService;
    private final TrainerClientService trainerClientService;

    public TrainerClientFacadeService(CurrentUserService currentUserService,
                                      TrainerClientService trainerClientService) {
        this.currentUserService = currentUserService;
        this.trainerClientService = trainerClientService;
    }

    @Transactional(readOnly = true)
    public List<TrainerClientResponse> getCurrentTrainerClients() {
        AppUser trainer = currentUserService.getCurrentTrainer();

        return trainerClientService.getClientsOfTrainer(trainer.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TrainerClientResponse getCurrentTrainerClient(Long clientId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        AppUser client = trainerClientService.getClientOfTrainer(trainer.getId(), clientId);

        return mapToResponse(client);
    }

    public TrainerClientResponse updateCurrentTrainerClient(Long clientId,
                                                            UpdateTrainerClientRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        AppUser updated = trainerClientService.updateClientOfTrainer(
                trainer.getId(),
                clientId,
                request.getFirstName(),
                request.getLastName()
        );

        return mapToResponse(updated);
    }

    public void deactivateCurrentTrainerClient(Long clientId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        trainerClientService.deactivateClientOfTrainer(trainer.getId(), clientId);
    }

    private TrainerClientResponse mapToResponse(AppUser client) {
        return new TrainerClientResponse()
                .setId(client.getId())
                .setEmail(client.getEmail())
                .setFirstName(client.getFirstName())
                .setLastName(client.getLastName())
                .setStatus(client.getStatus().name())
                .setCreatedAt(client.getCreatedAt());
    }
}