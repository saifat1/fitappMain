package ru.fitapp.backend.trainer.client.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.contract.dto.ClientContractSummary;
import ru.fitapp.backend.contract.dto.CreateClientContractRequest;
import ru.fitapp.backend.contract.service.ClientContractService;
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
import java.util.UUID;

@Service
@Transactional
public class TrainerClientFacadeService {

    private final CurrentUserService currentUserService;
    private final TrainerClientService trainerClientService;
    private final TrainerInviteService trainerInviteService;
    private final TrainerClientHistoryService trainerClientHistoryService;
    private final ClientContractService clientContractService;

    public TrainerClientFacadeService(
            CurrentUserService currentUserService,
            TrainerClientService trainerClientService,
            TrainerInviteService trainerInviteService,
            TrainerClientHistoryService trainerClientHistoryService,
            ClientContractService clientContractService
    ) {
        this.currentUserService = currentUserService;
        this.trainerClientService = trainerClientService;
        this.trainerInviteService = trainerInviteService;
        this.trainerClientHistoryService = trainerClientHistoryService;
        this.clientContractService = clientContractService;
    }

    @Transactional(readOnly = true)
    public List<TrainerClientResponse> getCurrentTrainerClients() {
        AppUser trainer = currentUserService.getCurrentTrainer();

        return trainerClientService.getClientsOfTrainer(trainer.getId())
                .stream()
                .map(client -> mapToResponse(client, trainer.getId()))
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
        return mapToResponse(client, trainer.getId());
    }

    public TrainerClientResponse createCurrentTrainerClient(CreateManualTrainerClientRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        String firstName = request.getFirstName() == null ? "" : request.getFirstName().trim();
        String lastName = request.getLastName() == null ? "" : request.getLastName().trim();

        boolean hasEmail = !email.isEmpty();
        boolean hasName = !firstName.isEmpty() || !lastName.isEmpty();

        // No email given: create a stub account with a unique placeholder address
        // so the underlying user record stays valid (email is the login identity).
        if (!hasEmail) {
            email = "manual-" + UUID.randomUUID() + "@fitapp.local";
        }

        // No identifying info at all: give the client a readable stub name "Клиент N".
        if (!hasEmail && !hasName) {
            int number = trainerClientService.getClientsOfTrainer(trainer.getId()).size() + 1;
            firstName = "Клиент " + number;
        }

        AppUser created = trainerClientService.createManualClientForTrainer(
                trainer,
                email,
                firstName.isEmpty() ? null : firstName,
                lastName.isEmpty() ? null : lastName
        );

        if (request.getInitialContractTotalTrainings() != null && request.getInitialContractTotalTrainings() > 0) {
            clientContractService.createContract(
                    trainer,
                    created,
                    new CreateClientContractRequest()
                            .setContractNumber(request.getInitialContractNumber())
                            .setTotalTrainings(request.getInitialContractTotalTrainings())
            );
        }

        return mapToResponse(created, trainer.getId());
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

        return mapToResponse(updated, trainer.getId());
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

    private TrainerClientResponse mapToResponse(AppUser client, Long trainerId) {
        ClientContractSummary summary = clientContractService.getSummary(client.getId(), trainerId);

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
                .setContractEndDate(client.getContractEndDate())
                .setHasContracts(summary.isHasContracts())
                .setTotalRemainingTrainings(summary.getTotalRemainingTrainings())
                .setContractExhausted(summary.isExhausted());
    }
}