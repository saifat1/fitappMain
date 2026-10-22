package ru.fitapp.backend.subscription.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.subscription.service.SubscriptionService;

import java.util.Map;

/**
 * Server-to-server payment notifications (permitAll in SecurityConfig). Authenticity is checked
 * by the provider adapter (signature / secret) in {@code parseNotification}.
 */
@RestController
@RequestMapping("/api/payments/notifications")
public class PaymentNotificationController {

    private final SubscriptionService subscriptionService;

    public PaymentNotificationController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/{provider}")
    public ResponseEntity<String> notify(
            @PathVariable String provider,
            @RequestHeader Map<String, String> headers,
            @RequestBody(required = false) String body
    ) {
        subscriptionService.handleProviderNotification(provider, headers, body != null ? body : "");
        return ResponseEntity.ok("OK");
    }
}
