package ru.fitapp.backend.subscription.model;

/**
 * Trainer subscription plans (approved 22.10.2026; Pro limit 30 → 15 in FIT-59). Prices are in kopecks;
 * the client limit counts the trainer's active (not archived) clients, null — no limit. Clients never pay.
 */
public enum SubscriptionPlan {
    FREE("Старт", 3, 0, 0),
    PRO("Pro", 15, 69_000, 590_000),
    UNLIMITED("Безлимит", null, 119_000, 990_000);

    private final String title;
    private final Integer clientLimit;
    private final int monthPriceKopecks;
    private final int yearPriceKopecks;

    SubscriptionPlan(String title, Integer clientLimit, int monthPriceKopecks, int yearPriceKopecks) {
        this.title = title;
        this.clientLimit = clientLimit;
        this.monthPriceKopecks = monthPriceKopecks;
        this.yearPriceKopecks = yearPriceKopecks;
    }

    public String getTitle() {
        return title;
    }

    public Integer getClientLimit() {
        return clientLimit;
    }

    public boolean isPaid() {
        return this != FREE;
    }

    public int priceKopecks(BillingPeriod period) {
        return period == BillingPeriod.YEAR ? yearPriceKopecks : monthPriceKopecks;
    }
}
