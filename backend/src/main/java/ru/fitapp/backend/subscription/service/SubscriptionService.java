package ru.fitapp.backend.subscription.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.subscription.dto.CheckoutResponse;
import ru.fitapp.backend.subscription.dto.SubscriptionResponse;
import ru.fitapp.backend.subscription.dto.TestPaymentCompleteRequest;
import ru.fitapp.backend.subscription.dto.TestPaymentResponse;
import ru.fitapp.backend.subscription.entity.SubscriptionPayment;
import ru.fitapp.backend.subscription.entity.TrainerSubscription;
import ru.fitapp.backend.subscription.model.BillingPeriod;
import ru.fitapp.backend.subscription.model.PaymentPurpose;
import ru.fitapp.backend.subscription.model.PaymentStatus;
import ru.fitapp.backend.subscription.model.SubscriptionPlan;
import ru.fitapp.backend.subscription.model.SubscriptionStatus;
import ru.fitapp.backend.subscription.payment.PaymentNotification;
import ru.fitapp.backend.subscription.payment.PaymentProvider;
import ru.fitapp.backend.subscription.payment.PaymentRequest;
import ru.fitapp.backend.subscription.payment.ProviderPayment;
import ru.fitapp.backend.subscription.payment.TestPaymentProvider;
import ru.fitapp.backend.subscription.repository.SubscriptionPaymentRepository;
import ru.fitapp.backend.subscription.repository.TrainerSubscriptionRepository;
import ru.fitapp.backend.trainerclient.entity.TrainerClient;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** «Подписка» screen, payments and renewals. Access rules live in {@link SubscriptionAccessService}. */
@Service
@Transactional
public class SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionService.class);

    /** Don't retry a declined renewal more often than this (the job runs hourly). */
    private static final Duration RENEWAL_RETRY_INTERVAL = Duration.ofHours(20);

    private final SubscriptionAccessService accessService;
    private final TrainerSubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository paymentRepository;
    private final CurrentUserService currentUserService;
    private final List<PaymentProvider> providers;
    private final String providerCode;
    private final String publicBaseUrl;

    public SubscriptionService(
            SubscriptionAccessService accessService,
            TrainerSubscriptionRepository subscriptionRepository,
            SubscriptionPaymentRepository paymentRepository,
            CurrentUserService currentUserService,
            List<PaymentProvider> providers,
            @Value("${app.billing.provider:test}") String providerCode,
            @Value("${app.public-base-url:http://localhost:3000}") String publicBaseUrl
    ) {
        this.accessService = accessService;
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.currentUserService = currentUserService;
        this.providers = providers;
        this.providerCode = providerCode;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    // ---------------------------------------------------------------- screen

    public SubscriptionResponse getCurrent() {
        List<SubscriptionResponse.PlanResponse> plans = Arrays.stream(SubscriptionPlan.values())
                .map(p -> new SubscriptionResponse.PlanResponse(
                        p.name(),
                        p.getTitle(),
                        p.getClientLimit(),
                        p.priceKopecks(BillingPeriod.MONTH),
                        p.priceKopecks(BillingPeriod.YEAR)
                ))
                .toList();

        if (!accessService.isEnabled()) {
            return new SubscriptionResponse(false, false, null, null, null, null, null, null, null, null,
                    false, null, null, 0, false, plans, List.of(), List.of());
        }

        AppUser trainer = currentUserService.getCurrentTrainer();
        TrainerSubscription s = accessService.getOrCreate(trainer);
        SubscriptionAccessService.Resolved resolved = accessService.resolve(s, LocalDateTime.now());
        Integer limit = resolved.plan().getClientLimit();
        List<TrainerClient> active = accessService.activeClients(trainer.getId());
        boolean overLimit = limit != null && active.size() > limit;

        List<SubscriptionResponse.PlanClientResponse> clients = !overLimit ? List.of() : java.util.stream.IntStream
                .range(0, active.size())
                .mapToObj(i -> {
                    TrainerClient tc = active.get(i);
                    return new SubscriptionResponse.PlanClientResponse(
                            tc.getClient().getId(),
                            displayName(tc.getClient()),
                            i < limit,
                            Boolean.TRUE.equals(tc.getPlanSelected())
                    );
                })
                .toList();

        List<SubscriptionResponse.PaymentResponse> payments = paymentRepository
                .findTop20ByTrainerIdOrderByCreatedAtDesc(trainer.getId())
                .stream()
                .filter(p -> p.getStatus() != PaymentStatus.PENDING || p.getPurpose() == PaymentPurpose.RENEWAL)
                .map(p -> new SubscriptionResponse.PaymentResponse(
                        p.getId(),
                        p.getCreatedAt(),
                        p.getPaidAt(),
                        p.getPlan().name(),
                        p.getBillingPeriod().name(),
                        p.getAmountKopecks(),
                        p.getPurpose().name(),
                        p.getStatus().name(),
                        p.getFailureReason()
                ))
                .toList();

        return new SubscriptionResponse(
                true,
                TestPaymentProvider.CODE.equals(providerCode),
                resolved.status().name(),
                resolved.plan().name(),
                resolved.plan().getTitle(),
                s.getPlan().name(),
                s.getBillingPeriod() != null ? s.getBillingPeriod().name() : null,
                resolved.status() == SubscriptionStatus.TRIAL ? s.getTrialEndsAt() : null,
                s.getPlan().isPaid() ? s.getPaidUntil() : null,
                resolved.status() == SubscriptionStatus.GRACE
                        ? s.getPaidUntil().plusDays(SubscriptionAccessService.GRACE_DAYS) : null,
                Boolean.TRUE.equals(s.getAutoRenew()),
                s.getPaymentMethodTitle(),
                limit,
                active.size(),
                overLimit,
                plans,
                payments,
                clients
        );
    }

    public SubscriptionResponse setAutoRenew(boolean enabledFlag) {
        assertEnabled();
        TrainerSubscription s = accessService.getOrCreate(currentUserService.getCurrentTrainer());
        if (enabledFlag && s.getPaymentMethodToken() == null) {
            throw new ApiException("VALIDATION_ERROR", "Сначала оплатите подписку картой — она сохранится для автопродления");
        }
        s.setAutoRenew(enabledFlag);
        return getCurrent();
    }

    /** The trainer picks which clients stay workable while over the plan's limit. */
    public SubscriptionResponse selectWorkableClients(List<Long> clientIds) {
        assertEnabled();
        AppUser trainer = currentUserService.getCurrentTrainer();
        Integer limit = accessService.clientLimit(trainer).orElse(null);
        Set<Long> chosen = new HashSet<>(clientIds);
        if (limit != null && chosen.size() > limit) {
            throw new ApiException("VALIDATION_ERROR", "На текущем тарифе можно выбрать не больше " + limit + " рабочих клиентов");
        }
        for (TrainerClient tc : accessService.activeClients(trainer.getId())) {
            tc.setPlanSelected(chosen.contains(tc.getClient().getId()));
        }
        return getCurrent();
    }

    // ---------------------------------------------------------------- payments

    public CheckoutResponse checkout(SubscriptionPlan plan, BillingPeriod period) {
        assertEnabled();
        if (!plan.isPaid()) {
            throw new ApiException("VALIDATION_ERROR", "Тариф «Старт» бесплатный — оплачивать его не нужно");
        }
        AppUser trainer = currentUserService.getCurrentTrainer();
        accessService.getOrCreate(trainer);
        PaymentProvider provider = provider();

        SubscriptionPayment payment = paymentRepository.save(new SubscriptionPayment()
                .setTrainer(trainer)
                .setPlan(plan)
                .setBillingPeriod(period)
                .setAmountKopecks(plan.priceKopecks(period))
                .setPurpose(PaymentPurpose.PURCHASE)
                .setStatus(PaymentStatus.PENDING)
                .setProvider(provider.code()));

        ProviderPayment created = provider.createPayment(paymentRequest(payment, trainer));
        payment.setProviderPaymentId(created.providerPaymentId());
        if (created.status() != PaymentStatus.PENDING) {
            apply(payment, new PaymentNotification(created.providerPaymentId(), created.status(),
                    created.paymentMethodToken(), created.paymentMethodTitle(), created.failureReason()));
        }
        return new CheckoutResponse(payment.getId(), created.confirmationUrl());
    }

    /** Server-to-server notification from the real provider (webhook). */
    public void handleProviderNotification(String code, Map<String, String> headers, String body) {
        PaymentProvider provider = providers.stream()
                .filter(p -> p.code().equals(code))
                .findFirst()
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Неизвестный платёжный сервис"));
        PaymentNotification notification = provider.parseNotification(headers, body)
                .orElseThrow(() -> new ApiException("VALIDATION_ERROR", "Некорректное уведомление об оплате"));
        SubscriptionPayment payment = paymentRepository
                .findByProviderAndProviderPaymentId(code, notification.providerPaymentId())
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Платёж не найден"));
        apply(payment, notification);
    }

    /**
     * Records the outcome; idempotent — only a PENDING payment changes. A successful payment
     * extends the subscription: same plan — from the current end date; another plan — from now,
     * with the unused paid days converted at the price ratio; a running trial is kept on top.
     */
    void apply(SubscriptionPayment payment, PaymentNotification n) {
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        TrainerSubscription s = accessService.getOrCreate(payment.getTrainer());

        if (n.status() == PaymentStatus.FAILED) {
            payment.setStatus(PaymentStatus.FAILED).setFailureReason(n.failureReason());
            return;
        }
        if (n.status() != PaymentStatus.SUCCEEDED) {
            return;
        }

        payment.setStatus(PaymentStatus.SUCCEEDED).setPaidAt(now);
        SubscriptionAccessService.Resolved resolved = accessService.resolve(s, now);
        BillingPeriod period = payment.getBillingPeriod();

        LocalDateTime paidUntil;
        if (payment.getPurpose() == PaymentPurpose.RENEWAL) {
            paidUntil = period.addTo(s.getPaidUntil() != null ? s.getPaidUntil() : now);
        } else if (s.getPlan() == payment.getPlan() && s.getBillingPeriod() == period
                && s.getPaidUntil() != null && s.getPaidUntil().isAfter(now)) {
            paidUntil = period.addTo(s.getPaidUntil());
        } else {
            LocalDateTime base = resolved.status() == SubscriptionStatus.TRIAL ? s.getTrialEndsAt() : now;
            paidUntil = period.addTo(base).plusSeconds(unusedCreditSeconds(s, payment, now));
        }

        s.setPlan(payment.getPlan())
                .setBillingPeriod(period)
                .setPaidUntil(paidUntil)
                .setTrialEndsAt(null)
                .setAutoRenew(true)
                .setLastRenewalAttemptAt(null);
        if (n.paymentMethodToken() != null) {
            s.setPaymentMethodToken(n.paymentMethodToken());
        }
        if (n.paymentMethodTitle() != null) {
            s.setPaymentMethodTitle(n.paymentMethodTitle());
        }
    }

    /** Remaining paid time of the old plan, re-priced at the new plan's daily rate. */
    private long unusedCreditSeconds(TrainerSubscription s, SubscriptionPayment payment, LocalDateTime now) {
        if (!s.getPlan().isPaid() || s.getBillingPeriod() == null || s.getPaidUntil() == null || !s.getPaidUntil().isAfter(now)) {
            return 0;
        }
        long remaining = Duration.between(now, s.getPaidUntil()).getSeconds();
        double oldDaily = dailyPrice(s.getPlan(), s.getBillingPeriod());
        double newDaily = dailyPrice(payment.getPlan(), payment.getBillingPeriod());
        return newDaily > 0 ? Math.round(remaining * oldDaily / newDaily) : 0;
    }

    private double dailyPrice(SubscriptionPlan plan, BillingPeriod period) {
        return plan.priceKopecks(period) / (period == BillingPeriod.YEAR ? 365.0 : 30.0);
    }

    /** Charges saved cards of subscriptions whose paid period ended (called hourly by the job). */
    public void renewDue() {
        if (!accessService.isEnabled()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        for (TrainerSubscription s : subscriptionRepository.findDueForRenewal(now, now.minusDays(SubscriptionAccessService.GRACE_DAYS))) {
            if (s.getLastRenewalAttemptAt() != null && s.getLastRenewalAttemptAt().isAfter(now.minus(RENEWAL_RETRY_INTERVAL))) {
                continue;
            }
            renew(s, now);
        }
    }

    private void renew(TrainerSubscription s, LocalDateTime now) {
        if (!s.getPlan().isPaid() || s.getBillingPeriod() == null) {
            return;
        }
        s.setLastRenewalAttemptAt(now);
        PaymentProvider provider = provider();
        SubscriptionPayment payment = paymentRepository.save(new SubscriptionPayment()
                .setTrainer(s.getTrainer())
                .setPlan(s.getPlan())
                .setBillingPeriod(s.getBillingPeriod())
                .setAmountKopecks(s.getPlan().priceKopecks(s.getBillingPeriod()))
                .setPurpose(PaymentPurpose.RENEWAL)
                .setStatus(PaymentStatus.PENDING)
                .setProvider(provider.code()));
        try {
            ProviderPayment result = provider.chargeSavedMethod(paymentRequest(payment, s.getTrainer()), s.getPaymentMethodToken());
            payment.setProviderPaymentId(result.providerPaymentId());
            apply(payment, new PaymentNotification(result.providerPaymentId(), result.status(),
                    null, result.paymentMethodTitle(), result.failureReason()));
        } catch (RuntimeException e) {
            log.warn("Renewal charge failed for trainer {}: {}", s.getTrainer().getId(), e.getMessage());
            payment.setStatus(PaymentStatus.FAILED).setFailureReason("Ошибка платёжного сервиса");
        }
    }

    // ---------------------------------------------------------------- test mode

    @Transactional(readOnly = true)
    public TestPaymentResponse getTestPayment(Long paymentId) {
        SubscriptionPayment p = testPayment(paymentId);
        return new TestPaymentResponse(p.getId(), p.getPlan().getTitle(), p.getBillingPeriod().name(), p.getAmountKopecks(), p.getStatus().name());
    }

    public SubscriptionResponse completeTestPayment(Long paymentId, TestPaymentCompleteRequest.Outcome outcome) {
        SubscriptionPayment p = testPayment(paymentId);
        PaymentNotification n = switch (outcome) {
            case PAY -> new PaymentNotification(p.getProviderPaymentId(), PaymentStatus.SUCCEEDED, "test-card-ok", "Тестовая карта •• 4242", null);
            case PAY_FAILING_CARD -> new PaymentNotification(p.getProviderPaymentId(), PaymentStatus.SUCCEEDED,
                    TestPaymentProvider.FAILING_CARD_TOKEN, "Тестовая карта •• 0002 (откажет при продлении)", null);
            case DECLINE -> new PaymentNotification(p.getProviderPaymentId(), PaymentStatus.FAILED, null, null, "Тестовый отказ банка");
        };
        apply(p, n);
        return getCurrent();
    }

    /** Pretends the trial and the paid period ended {@code daysAgo} days ago, then runs renewal. */
    public SubscriptionResponse shiftForTest(int daysAgo) {
        assertTestMode();
        TrainerSubscription s = accessService.getOrCreate(currentUserService.getCurrentTrainer());
        LocalDateTime end = LocalDateTime.now().minusDays(daysAgo).minusMinutes(1);
        if (s.getTrialEndsAt() != null) {
            s.setTrialEndsAt(end);
        }
        if (s.getPaidUntil() != null) {
            s.setPaidUntil(end);
        }
        s.setLastRenewalAttemptAt(null);
        if (daysAgo < SubscriptionAccessService.GRACE_DAYS && Boolean.TRUE.equals(s.getAutoRenew()) && s.getPaymentMethodToken() != null) {
            renew(s, LocalDateTime.now());
        }
        return getCurrent();
    }

    private SubscriptionPayment testPayment(Long paymentId) {
        assertTestMode();
        AppUser trainer = currentUserService.getCurrentTrainer();
        return paymentRepository.findByIdAndTrainerId(paymentId, trainer.getId())
                .filter(p -> TestPaymentProvider.CODE.equals(p.getProvider()))
                .orElseThrow(() -> new ApiException("NOT_FOUND", "Платёж не найден"));
    }

    // ---------------------------------------------------------------- helpers

    private PaymentRequest paymentRequest(SubscriptionPayment payment, AppUser trainer) {
        String description = "Подписка FitApp «" + payment.getPlan().getTitle() + "» на "
                + (payment.getBillingPeriod() == BillingPeriod.YEAR ? "год" : "месяц");
        return new PaymentRequest(payment.getId(), payment.getAmountKopecks(), description,
                publicBaseUrl + "/subscription?payment=" + payment.getId(), trainer.getEmail());
    }

    private PaymentProvider provider() {
        return providers.stream()
                .filter(p -> p.code().equals(providerCode))
                .findFirst()
                .orElseThrow(() -> new ApiException("INTERNAL_ERROR", "Платёжный сервис не настроен"));
    }

    private void assertEnabled() {
        if (!accessService.isEnabled()) {
            throw new ApiException("VALIDATION_ERROR", "Оплата подписки скоро появится");
        }
    }

    private void assertTestMode() {
        assertEnabled();
        if (!TestPaymentProvider.CODE.equals(providerCode)) {
            throw new ApiException("NOT_FOUND", "Тестовый режим оплаты выключен");
        }
    }

    private static String displayName(AppUser user) {
        String full = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();
        return full.isEmpty() ? user.getEmail() : full;
    }
}
