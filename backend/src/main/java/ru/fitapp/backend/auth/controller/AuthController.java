package ru.fitapp.backend.auth.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.auth.dto.AuthResponse;
import ru.fitapp.backend.auth.dto.CurrentUserResponse;
import ru.fitapp.backend.auth.dto.InviteDetailsResponse;
import ru.fitapp.backend.auth.dto.LoginRequest;
import ru.fitapp.backend.auth.dto.RegisterByInviteRequest;
import ru.fitapp.backend.auth.dto.RegisterTrainerRequest;
import ru.fitapp.backend.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
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

    @GetMapping("/me")
    public CurrentUserResponse me() {
        return authService.me();
    }
}