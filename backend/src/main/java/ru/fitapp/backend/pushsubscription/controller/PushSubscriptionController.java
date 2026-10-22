package ru.fitapp.backend.pushsubscription.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.pushsubscription.dto.PushPublicKeyResponse;
import ru.fitapp.backend.pushsubscription.dto.RegisterDeviceTokenRequest;
import ru.fitapp.backend.pushsubscription.dto.SubscribePushRequest;
import ru.fitapp.backend.pushsubscription.dto.UnsubscribePushRequest;
import ru.fitapp.backend.pushsubscription.service.FcmPushService;
import ru.fitapp.backend.pushsubscription.service.WebPushService;
import ru.fitapp.backend.user.entity.AppUser;

@RestController
@RequestMapping("/api/push")
public class PushSubscriptionController {

    private final WebPushService webPushService;
    private final FcmPushService fcmPushService;
    private final CurrentUserService currentUserService;

    public PushSubscriptionController(
            WebPushService webPushService,
            FcmPushService fcmPushService,
            CurrentUserService currentUserService
    ) {
        this.webPushService = webPushService;
        this.fcmPushService = fcmPushService;
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

    /** Store app (FIT-69): the device's Firebase token for the signed-in user. */
    @PostMapping("/devices")
    public void registerDevice(@Valid @RequestBody RegisterDeviceTokenRequest request) {
        fcmPushService.registerDevice(currentUserService.getCurrentUser(), request);
    }

    /** Called on logout from the app, so the next user of the phone doesn't get these notifications. */
    @PostMapping("/devices/remove")
    public void unregisterDevice(@Valid @RequestBody RegisterDeviceTokenRequest request) {
        fcmPushService.unregisterDevice(request.getToken());
    }
}
