package ru.fitapp.backend.auth.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.auth.dto.AuthResponse;
import ru.fitapp.backend.auth.dto.CurrentUserResponse;
import ru.fitapp.backend.auth.dto.InviteDetailsResponse;
import ru.fitapp.backend.auth.dto.LoginRequest;
import ru.fitapp.backend.auth.dto.RegisterByInviteRequest;
import ru.fitapp.backend.auth.dto.RegisterTrainerRequest;
import ru.fitapp.backend.auth.passwordreset.dto.ForgotPasswordRequest;
import ru.fitapp.backend.auth.passwordreset.dto.MessageResponse;
import ru.fitapp.backend.auth.passwordreset.dto.ResetPasswordRequest;
import ru.fitapp.backend.auth.passwordreset.service.PasswordResetService;
import ru.fitapp.backend.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        return authService.login(request, httpRequest);
    }

    @GetMapping("/invites/{token}")
    public InviteDetailsResponse getInviteDetails(@PathVariable String token) {
        return authService.getInviteDetails(token);
    }

    @PostMapping("/register-by-invite")
    public AuthResponse registerByInvite(@Valid @RequestBody RegisterByInviteRequest request) {
        return authService.registerByInvite(request);
    }

    @PostMapping("/register-trainer")
    public AuthResponse registerTrainer(@Valid @RequestBody RegisterTrainerRequest request) {
        return authService.registerTrainer(request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.getEmail());
        return new MessageResponse("Если такой email зарегистрирован, мы отправили письмо со ссылкой");
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return new MessageResponse("Пароль обновлён");
    }

    @GetMapping("/me")
    public CurrentUserResponse me() {
        return authService.me();
    }
}