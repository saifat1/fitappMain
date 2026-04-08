package ru.fitapp.backend.trainer.invite.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.invite.entity.Invite;
import ru.fitapp.backend.invite.model.InviteStatus;
import ru.fitapp.backend.invite.repository.InviteRepository;
import ru.fitapp.backend.trainer.invite.dto.CreateInviteRequest;
import ru.fitapp.backend.trainer.invite.dto.InviteResponse;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TrainerInviteService {

    private final InviteRepository inviteRepository;
    private final CurrentUserService currentUserService;

    public TrainerInviteService(InviteRepository inviteRepository,
                                CurrentUserService currentUserService) {
        this.inviteRepository = inviteRepository;
        this.currentUserService = currentUserService;
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

    @Transactional(readOnly = true)
    public List<InviteResponse> getCurrentTrainerInvites() {
        AppUser trainer = currentUserService.getCurrentTrainer();

        return inviteRepository.findAllByTrainerId(trainer.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private InviteResponse mapToResponse(Invite invite) {
        return new InviteResponse()
                .setId(invite.getId())
                .setToken(invite.getToken())
                .setEmail(invite.getEmail())
                .setStatus(invite.getStatus().name())
                .setExpiresAt(invite.getExpiresAt())
                .setUsedAt(invite.getUsedAt())
                .setRegistrationLink("http://localhost:5173/invite/" + invite.getToken());
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