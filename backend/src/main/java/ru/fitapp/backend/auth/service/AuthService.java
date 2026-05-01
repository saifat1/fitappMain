package ru.fitapp.backend.auth.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.auth.dto.AuthResponse;
import ru.fitapp.backend.auth.dto.CurrentUserResponse;
import ru.fitapp.backend.auth.dto.InviteDetailsResponse;
import ru.fitapp.backend.auth.dto.LoginRequest;
import ru.fitapp.backend.auth.dto.RegisterByInviteRequest;
import ru.fitapp.backend.auth.dto.RegisterTrainerRequest;
import ru.fitapp.backend.auth.security.JwtService;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.invite.entity.Invite;
import ru.fitapp.backend.invite.service.InviteService;
import ru.fitapp.backend.trainerclient.service.TrainerClientService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
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

    public AuthService(
            UserService userService,
            InviteService inviteService,
            TrainerClientService trainerClientService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
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

        if (user.getRole() == UserRole.CLIENT && user.isCreatedByTrainer() && !user.isClaimedByClient()) {
            throw new ApiException(
                    "CLIENT_REGISTRATION_NOT_COMPLETED",
                    "Аккаунт ещё не завершил регистрацию. Используйте ссылку-приглашение"
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException("INVALID_CREDENTIALS", "Неверный email или пароль");
        }

        String token = jwtService.generateToken(user);
        return buildAuthResponse(user, token);
    }

    @Transactional(readOnly = true)
    public InviteDetailsResponse getInviteDetails(String token) {
        Invite invite = inviteService.validateForRegistration(token);

        return new InviteDetailsResponse()
                .setEmail(invite.getEmail());
    }

    public AuthResponse registerByInvite(RegisterByInviteRequest request) {
        Invite invite = inviteService.validateForRegistration(request.getToken());

        if (invite.getClient() != null) {
            AppUser existingClient = invite.getClient();

            validateInviteEmail(existingClient.getEmail(), request.getEmail());

            AppUser claimedClient = userService.claimClientRegistration(
                    existingClient,
                    passwordEncoder.encode(request.getPassword()),
                    request.getFirstName(),
                    request.getLastName()
            );

            inviteService.markAsUsed(invite);

            String token = jwtService.generateToken(claimedClient);
            return buildAuthResponse(claimedClient, token);
        }

        validateInviteEmail(invite.getEmail(), request.getEmail());

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

    public AuthResponse registerTrainer(RegisterTrainerRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ApiException(
                    "PASSWORD_CONFIRMATION_MISMATCH",
                    "Подтверждение пароля не совпадает"
            );
        }

        AppUser trainer = userService.createTrainer(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName(),
                request.getLastName()
        );

        String token = jwtService.generateToken(trainer);
        return buildAuthResponse(trainer, token);
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

    private void validateInviteEmail(String inviteEmailRaw, String requestEmailRaw) {
        if (inviteEmailRaw == null || inviteEmailRaw.isBlank()) {
            return;
        }

        String inviteEmail = inviteEmailRaw.trim().toLowerCase();

        if (requestEmailRaw == null || requestEmailRaw.isBlank()) {
            throw new ApiException("VALIDATION_ERROR", "Email не должен быть пустым");
        }

        String requestEmail = requestEmailRaw.trim().toLowerCase();

        if (!inviteEmail.equals(requestEmail)) {
            throw new ApiException("INVITE_EMAIL_MISMATCH", "Email не соответствует приглашению");
        }
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