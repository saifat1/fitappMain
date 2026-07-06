package ru.fitapp.backend.pushsubscription.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.pushsubscription.dto.PushPublicKeyResponse;
import ru.fitapp.backend.pushsubscription.dto.SubscribePushRequest;
import ru.fitapp.backend.pushsubscription.dto.UnsubscribePushRequest;
import ru.fitapp.backend.pushsubscription.service.WebPushService;
import ru.fitapp.backend.user.entity.AppUser;

@RestController
@RequestMapping("/api/push")
public class PushSubscriptionController {

    private final WebPushService webPushService;
    private final CurrentUserService currentUserService;

    public PushSubscriptionController(WebPushService webPushService, CurrentUserService currentUserService) {
        this.webPushService = webPushService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/public-key")
    public PushPublicKeyResponse getPublicKey() {
        return new PushPublicKeyResponse(webPushService.getPublicKey());
    }

    @PostMapping("/subscribe")
    public void subscribe(@Valid @RequestBody SubscribePushRequest request) {
        AppUser user = currentUserService.getCurrentUser();
        webPushService.subscribe(user, request);
    }

    @PostMapping("/unsubscribe")
    public void unsubscribe(@Valid @RequestBody UnsubscribePushRequest request) {
        webPushService.unsubscribe(request.getEndpoint());
    }
}
