package ru.fitapp.backend.trainer.client.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.trainer.client.dto.CreateManualTrainerClientRequest;
import ru.fitapp.backend.trainer.client.dto.CreateTrainerClientInviteRequest;
import ru.fitapp.backend.trainer.client.dto.TrainerClientResponse;
import ru.fitapp.backend.trainer.client.dto.UpdateTrainerClientRequest;
import ru.fitapp.backend.trainer.invite.dto.InviteResponse;
import ru.fitapp.backend.trainer.invite.service.TrainerInviteService;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.trainer.client.dto.ClientHistoryResponse;

import java.util.List;

@Service
@Transactional
public class TrainerClientFacadeService {

    private final CurrentUserService currentUserService;
    private final TrainerClientService trainerClientService;
    private final TrainerInviteService trainerInviteService;
    private final TrainerClientHistoryService trainerClientHistoryService;

    public TrainerClientFacadeService(
            CurrentUserService currentUserService,
            TrainerClientService trainerClientService,
            TrainerInviteService trainerInviteService, TrainerClientHistoryService trainerClientHistoryService
    ) {
        this.currentUserService = currentUserService;
        this.trainerClientService = trainerClientService;
        this.trainerInviteService = trainerInviteService;
        this.trainerClientHistoryService = trainerClientHistoryService;
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
    public ClientHistoryResponse getCurrentTrainerClientHistory(Long clientId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        return trainerClientHistoryService.getTrainerClientHistory(trainer, clientId);
    }

    @Transactional(readOnly = true)
    public TrainerClientResponse getCurrentTrainerClient(Long clientId) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        AppUser client = trainerClientService.getClientOfTrainer(trainer.getId(), clientId);
        return mapToResponse(client);
    }

    public TrainerClientResponse createCurrentTrainerClient(CreateManualTrainerClientRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        AppUser created = trainerClientService.createManualClientForTrainer(
                trainer,
                request.getEmail(),
                request.getFirstName(),
                request.getLastName()
        );

        return mapToResponse(created);
    }

    public TrainerClientResponse updateCurrentTrainerClient(Long clientId, UpdateTrainerClientRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        AppUser updated = trainerClientService.updateClientOfTrainer(
                trainer.getId(),
                clientId,
                request.getFirstName(),
                request.getLastName(),
                request.getContractNumber(),
                request.getContractEndDate()
        );

        return mapToResponse(updated);
    }

    public InviteResponse createInviteForCurrentTrainerClient(
            Long clientId,
            CreateTrainerClientInviteRequest request
    ) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        Integer expiresInDays = request == null ? null : request.getExpiresInDays();
        return trainerInviteService.createInviteForClient(trainer, clientId, expiresInDays);
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
                .setCreatedByTrainer(client.isCreatedByTrainer())
                .setClaimedByClient(client.isClaimedByClient())
                .setClaimedAt(client.getClaimedAt())
                .setCreatedAt(client.getCreatedAt())
                .setContractNumber(client.getContractNumber())
                .setContractEndDate(client.getContractEndDate());
    }
}