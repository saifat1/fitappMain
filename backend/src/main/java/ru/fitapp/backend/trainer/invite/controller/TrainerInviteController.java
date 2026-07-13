package ru.fitapp.backend.trainer.invite.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.trainer.invite.dto.CreateInviteRequest;
import ru.fitapp.backend.trainer.invite.dto.InviteResponse;
import ru.fitapp.backend.trainer.invite.service.TrainerInviteService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/trainer/invites")
public class TrainerInviteController {

    private final TrainerInviteService trainerInviteService;

    public TrainerInviteController(TrainerInviteService trainerInviteService) {
        this.trainerInviteService = trainerInviteService;
    }

    @PostMapping
    public InviteResponse createInvite(@Valid @RequestBody CreateInviteRequest request) {
        return trainerInviteService.createInvite(request);
    }

    @GetMapping
    public List<InviteResponse> getCurrentTrainerInvites(
            @RequestParam(defaultValue = "false") boolean includeAll
    ) {
        return trainerInviteService.getCurrentTrainerInvites(includeAll);
    }

    @DeleteMapping("/{inviteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteInvite(@PathVariable Long inviteId) {
        trainerInviteService.deleteInvite(inviteId);
    }
}