package ru.fitapp.backend.auth.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.auth.dto.AuthResponse;
import ru.fitapp.backend.auth.dto.CurrentUserResponse;
import ru.fitapp.backend.auth.dto.LoginRequest;
import ru.fitapp.backend.auth.dto.RegisterByInviteRequest;
import ru.fitapp.backend.auth.security.JwtService;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.invite.entity.Invite;
import ru.fitapp.backend.invite.service.InviteService;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserStatus;
import ru.fitapp.backend.user.service.UserService;

@Service
@Transactional
public class AuthService {

    private final UserService userService;
    private final InviteService inviteService;
    private final TrainerClientService trainerClientService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserService userService,
                       InviteService inviteService, TrainerClientService trainerClientService,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userService = userService;
        this.inviteService = inviteService;
        this.trainerClientService = trainerClientService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = userService.getByEmail(request.getEmail());

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException("USER_INACTIVE", "Пользователь неактивен");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException("INVALID_CREDENTIALS", "Неверный email или пароль");
        }

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    public AuthResponse registerByInvite(RegisterByInviteRequest request) {
        Invite invite = inviteService.validateForRegistration(request.getToken());

        if (invite.getEmail() != null && !invite.getEmail().isBlank()) {
            String inviteEmail = invite.getEmail().trim().toLowerCase();
            String requestEmail = request.getEmail().trim().toLowerCase();

            if (!inviteEmail.equals(requestEmail)) {
                throw new ApiException("INVITE_EMAIL_MISMATCH", "Email не соответствует приглашению");
            }
        }

        AppUser client = userService.createClient(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName(),
                request.getLastName()
        );

        trainerClientService.linkTrainerToClient(invite.getTrainer(), client);

        inviteService.markAsUsed(invite);

        String token = jwtService.generateToken(client);
        return buildAuthResponse(client, token);
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new ApiException("UNAUTHORIZED", "Пользователь не авторизован");
        }

        AppUser user = userService.getByEmail(authentication.getName());

        return new CurrentUserResponse()
                .setId(user.getId())
                .setEmail(user.getEmail())
                .setRole(user.getRole().name())
                .setFirstName(user.getFirstName())
                .setLastName(user.getLastName());
    }

    private AuthResponse buildAuthResponse(AppUser user, String token) {
        return new AuthResponse()
                .setAccessToken(token)
                .setTokenType("Bearer")
                .setUserId(user.getId())
                .setEmail(user.getEmail())
                .setRole(user.getRole().name());
    }
}