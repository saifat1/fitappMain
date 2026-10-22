package ru.fitapp.backend.subscription.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.subscription.dto.PublicPricingResponse;
import ru.fitapp.backend.subscription.dto.SubscriptionResponse;
import ru.fitapp.backend.subscription.model.BillingPeriod;
import ru.fitapp.backend.subscription.model.SubscriptionPlan;
import ru.fitapp.backend.subscription.service.SubscriptionAccessService;

import java.util.Arrays;

/** No auth (permitAll): the payment provider requires prices, terms and seller details to be public. */
@RestController
@RequestMapping("/api/public")
public class PublicPricingController {

    private final PublicPricingResponse.Seller seller;

    public PublicPricingController(
            @Value("${app.seller.name:}") String name,
            @Value("${app.seller.inn:}") String inn,
            @Value("${app.seller.email:}") String email,
            @Value("${app.seller.phone:}") String phone
    ) {
        this.seller = new PublicPricingResponse.Seller(
                name.trim(),
                inn.trim(),
                email.trim(),
                phone.trim(),
                "Плательщик налога на профессиональный доход (самозанятый)"
        );
    }

    @GetMapping("/pricing")
    public PublicPricingResponse pricing() {
        return new PublicPricingResponse(
                seller,
                Arrays.stream(SubscriptionPlan.values())
                        .map(p -> new SubscriptionResponse.PlanResponse(
                                p.name(),
                                p.getTitle(),
                                p.getClientLimit(),
                                p.priceKopecks(BillingPeriod.MONTH),
                                p.priceKopecks(BillingPeriod.YEAR)
                        ))
                        .toList(),
                SubscriptionAccessService.TRIAL_DAYS,
                SubscriptionAccessService.GRACE_DAYS
        );
    }
}
