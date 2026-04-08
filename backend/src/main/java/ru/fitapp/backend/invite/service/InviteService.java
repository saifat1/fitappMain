package ru.fitapp.backend.invite.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.invite.entity.Invite;
import ru.fitapp.backend.invite.model.InviteStatus;
import ru.fitapp.backend.invite.repository.InviteRepository;

import java.time.LocalDateTime;

@Service
@Transactional
public class InviteService {

    private final InviteRepository inviteRepository;

    public InviteService(InviteRepository inviteRepository) {
        this.inviteRepository = inviteRepository;
    }

    @Transactional(readOnly = true)
    public Invite getByToken(String token) {
        return inviteRepository.findByToken(normalizeToken(token))
                .orElseThrow(() -> new ApiException("INVITE_NOT_FOUND", "Ссылка приглашения не найдена"));
    }

    @Transactional(readOnly = true)
    public Invite validateForRegistration(String token) {
        Invite invite = getByToken(token);

        if (invite.getStatus() == InviteStatus.USED || invite.getUsedAt() != null) {
            throw new ApiException("INVITE_ALREADY_USED", "Ссылка приглашения уже использована");
        }

        if (invite.getStatus() == InviteStatus.CANCELLED) {
            throw new ApiException("INVITE_CANCELLED", "Ссылка приглашения отменена");
        }

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("INVITE_EXPIRED", "Срок действия ссылки приглашения истёк");
        }

        return invite;
    }

    public Invite markAsUsed(Invite invite) {
        invite.setStatus(InviteStatus.USED);
        invite.setUsedAt(LocalDateTime.now());
        return inviteRepository.save(invite);
    }

    private String normalizeToken(String token) {
        if (token == null || token.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Токен приглашения не должен быть пустым");
        }
        return token.trim();
    }
}