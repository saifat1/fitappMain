package ru.fitapp.backend.subscription.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.subscription.dto.AutoRenewRequest;
import ru.fitapp.backend.subscription.dto.CheckoutRequest;
import ru.fitapp.backend.subscription.dto.CheckoutResponse;
import ru.fitapp.backend.subscription.dto.SubscriptionResponse;
import ru.fitapp.backend.subscription.dto.TestPaymentCompleteRequest;
import ru.fitapp.backend.subscription.dto.TestPaymentResponse;
import ru.fitapp.backend.subscription.dto.TestShiftRequest;
import ru.fitapp.backend.subscription.dto.WorkableClientsRequest;
import ru.fitapp.backend.subscription.service.SubscriptionService;

@RestController
@RequestMapping("/api/trainer/subscription")
public class TrainerSubscriptionController {

    private final SubscriptionService subscriptionService;

    public TrainerSubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public SubscriptionResponse getCurrent() {
        return subscriptionService.getCurrent();
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@Valid @RequestBody CheckoutRequest request) {
        return subscriptionService.checkout(request.plan(), request.billingPeriod());
    }

    @PutMapping("/auto-renew")
    public SubscriptionResponse setAutoRenew(@Valid @RequestBody AutoRenewRequest request) {
        return subscriptionService.setAutoRenew(request.enabled());
    }

    @PutMapping("/workable-clients")
    public SubscriptionResponse selectWorkableClients(@Valid @RequestBody WorkableClientsRequest request) {
        return subscriptionService.selectWorkableClients(request.clientIds());
    }

    // Test mode only (app.billing.provider=test): our own payment page instead of the provider's.

    @GetMapping("/test-payments/{paymentId}")
    public TestPaymentResponse getTestPayment(@PathVariable Long paymentId) {
        return subscriptionService.getTestPayment(paymentId);
    }

    @PostMapping("/test-payments/{paymentId}/complete")
    public SubscriptionResponse completeTestPayment(
            @PathVariable Long paymentId,
            @Valid @RequestBody TestPaymentCompleteRequest request
    ) {
        return subscriptionService.completeTestPayment(paymentId, request.outcome());
    }

    @PostMapping("/test/shift")
    public SubscriptionResponse shiftForTest(@Valid @RequestBody TestShiftRequest request) {
        return subscriptionService.shiftForTest(request.daysAgo());
    }
}
