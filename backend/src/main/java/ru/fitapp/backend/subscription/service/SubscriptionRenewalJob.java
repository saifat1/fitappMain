package ru.fitapp.backend.subscription.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Hourly: charges saved cards of subscriptions whose paid period ended (retried within the 3-day grace). */
@Component
public class SubscriptionRenewalJob {

    private final SubscriptionService subscriptionService;

    public SubscriptionRenewalJob(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @Scheduled(cron = "0 17 * * * *")
    public void renew() {
        subscriptionService.renewDue();
    }
}
