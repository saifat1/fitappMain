package ru.fitapp.backend.trainer.invite.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.invite.entity.Invite;
import ru.fitapp.backend.invite.model.InviteStatus;
import ru.fitapp.backend.invite.repository.InviteRepository;
import ru.fitapp.backend.trainer.invite.dto.CreateInviteRequest;
import ru.fitapp.backend.trainer.invite.dto.InviteResponse;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TrainerInviteService {

    private final InviteRepository inviteRepository;
    private final CurrentUserService currentUserService;
    private final TrainerClientService trainerClientService;

    @Value("${app.public-base-url}")
    private String publicBaseUrl;

    public TrainerInviteService(
            InviteRepository inviteRepository,
            CurrentUserService currentUserService,
            TrainerClientService trainerClientService
    ) {
        this.inviteRepository = inviteRepository;
        this.currentUserService = currentUserService;
        this.trainerClientService = trainerClientService;
    }

    public InviteResponse createInvite(CreateInviteRequest request) {
        AppUser trainer = currentUserService.getCurrentTrainer();
        int expiresInDays = request.getExpiresInDays() == null ? 7 : request.getExpiresInDays();
        String normalizedEmail = normalizeEmail(request.getEmail());

        Invite invite = new Invite()
                .setToken(generateToken())
                .setTrainer(trainer)
                .setEmail(normalizedEmail)
                .setExpiresAt(LocalDateTime.now().plusDays(expiresInDays))
                .setStatus(InviteStatus.NEW);

        Invite saved = inviteRepository.save(invite);
        return mapToResponse(saved);
    }

    public InviteResponse createInviteForClient(AppUser trainer, Long clientId, Integer expiresInDays) {
        AppUser client = trainerClientService.getClientOfTrainer(trainer.getId(), clientId);

        if (client.getEmail() == null || client.getEmail().isBlank()) {
            throw new ApiException(
                    "CLIENT_EMAIL_REQUIRED",
                    "Для клиента должен быть указан email, чтобы завершить регистрацию"
            );
        }

        if (client.isClaimedByClient()) {
            throw new ApiException(
                    "CLIENT_ALREADY_CLAIMED",
                    "Клиент уже завершил регистрацию"
            );
        }

        cancelActiveClientInvites(client.getId());

        int effectiveExpiresInDays = expiresInDays == null ? 7 : expiresInDays;

        Invite invite = new Invite()
                .setToken(generateToken())
                .setTrainer(trainer)
                .setClient(client)
                .setEmail(client.getEmail())
                .setExpiresAt(LocalDateTime.now().plusDays(effectiveExpiresInDays))
                .setStatus(InviteStatus.NEW);

        Invite saved = inviteRepository.save(invite);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<InviteResponse> getCurrentTrainerInvites(boolean includeAll) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        return inviteRepository.findAllByTrainerIdOrderByCreatedAtDesc(trainer.getId())
                .stream()
                .filter(invite -> includeAll || resolveStatus(invite) == InviteStatus.NEW)
                .map(this::mapToResponse)
                .toList();
    }

    public void deleteInvite(Long inviteId) {
        AppUser trainer = currentUserService.getCurrentTrainer();

        Invite invite = inviteRepository.findByIdAndTrainerId(inviteId, trainer.getId())
                .orElseThrow(() -> new ApiException("INVITE_NOT_FOUND", "Приглашение не найдено"));

        inviteRepository.delete(invite);
    }

    private void cancelActiveClientInvites(Long clientId) {
        List<Invite> invites = inviteRepository.findAllByClientIdAndStatusInOrderByCreatedAtDesc(
                clientId,
                List.of(InviteStatus.NEW)
        );

        for (Invite invite : invites) {
            if (resolveStatus(invite) == InviteStatus.NEW) {
                invite.setStatus(InviteStatus.CANCELLED);
            }
        }

        if (!invites.isEmpty()) {
            inviteRepository.saveAll(invites);
        }
    }

    private InviteResponse mapToResponse(Invite invite) {
        InviteStatus actualStatus = resolveStatus(invite);

        return new InviteResponse()
                .setId(invite.getId())
                .setClientId(invite.getClient() != null ? invite.getClient().getId() : null)
                .setToken(invite.getToken())
                .setEmail(invite.getEmail())
                .setStatus(actualStatus.name())
                .setExpiresAt(invite.getExpiresAt())
                .setUsedAt(invite.getUsedAt())
                .setRegistrationLink(publicBaseUrl + "/invite/" + invite.getToken());
    }

    private InviteStatus resolveStatus(Invite invite) {
        if (invite.getStatus() == InviteStatus.CANCELLED) {
            return InviteStatus.CANCELLED;
        }
        if (invite.getStatus() == InviteStatus.USED || invite.getUsedAt() != null) {
            return InviteStatus.USED;
        }
        if (invite.getExpiresAt() != null && invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            return InviteStatus.EXPIRED;
        }
        return InviteStatus.NEW;
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}