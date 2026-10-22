package ru.fitapp.backend.subscription.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.subscription.service.SubscriptionService;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Server-to-server payment notifications (permitAll in SecurityConfig). Authenticity is checked
 * by the provider adapter (signature / secret) in {@code parseNotification}. Accepts POST bodies
 * and GET query strings (Robokassa's ResultURL method is configurable in the shop settings).
 */
@RestController
@RequestMapping("/api/payments/notifications")
public class PaymentNotificationController {

    private final SubscriptionService subscriptionService;

    public PaymentNotificationController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @RequestMapping(value = "/{provider}", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<String> notify(
            @PathVariable String provider,
            @RequestHeader Map<String, String> headers,
            @RequestBody(required = false) String body,
            HttpServletRequest request
    ) {
        // Form POST body as is; if it was already consumed as parameters (or it's a GET), re-encode them.
        String payload = body != null && !body.isBlank() ? body : request.getParameterMap().entrySet().stream()
                .flatMap(e -> Arrays.stream(e.getValue()).map(v -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8)
                        + "=" + URLEncoder.encode(v, StandardCharsets.UTF_8)))
                .collect(Collectors.joining("&"));
        String reply = subscriptionService.handleProviderNotification(provider, headers, payload);
        return ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN).body(reply);
    }
}
