package ru.fitapp.backend.subscription.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.subscription.entity.TrainerSubscription;
import ru.fitapp.backend.subscription.model.SubscriptionPlan;
import ru.fitapp.backend.subscription.model.SubscriptionStatus;
import ru.fitapp.backend.subscription.repository.TrainerSubscriptionRepository;
import ru.fitapp.backend.trainerclient.entity.TrainerClient;
import ru.fitapp.backend.trainerclient.repository.TrainerClientRepository;
import ru.fitapp.backend.user.entity.AppUser;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * What a trainer's subscription allows right now (rules approved 22.10.2026):
 * <ul>
 *     <li>14-day Pro trial from the first visit, no card needed;</li>
 *     <li>paid period, then 3 days of grace while the renewal is retried — everything still works;</li>
 *     <li>after that the free plan: up to 3 active clients stay workable (chosen by the trainer,
 *     default — the earliest added), the rest are read-only: history is visible, but no new
 *     trainings / bookings. Nothing is ever deleted.</li>
 * </ul>
 * With {@code app.billing.enabled=false} nothing is limited.
 */
@Service
@Transactional
public class SubscriptionAccessService {

    public static final int TRIAL_DAYS = 14;
    public static final int GRACE_DAYS = 3;

    private final TrainerSubscriptionRepository subscriptionRepository;
    private final TrainerClientRepository trainerClientRepository;
    private final boolean enabled;

    public SubscriptionAccessService(
            TrainerSubscriptionRepository subscriptionRepository,
            TrainerClientRepository trainerClientRepository,
            @Value("${app.billing.enabled:false}") boolean enabled
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.trainerClientRepository = trainerClientRepository;
        this.enabled = enabled;
    }

    public boolean isEnabled() {
        return enabled;
    }

    /** The trainer's row; created with a fresh trial on first access. */
    public TrainerSubscription getOrCreate(AppUser trainer) {
        return subscriptionRepository.findByTrainerId(trainer.getId())
                .orElseGet(() -> subscriptionRepository.save(new TrainerSubscription()
                        .setTrainer(trainer)
                        .setPlan(SubscriptionPlan.FREE)
                        .setTrialEndsAt(LocalDateTime.now().plusDays(TRIAL_DAYS))));
    }

    public Resolved resolve(TrainerSubscription s, LocalDateTime now) {
        if (s.getPaidUntil() != null && s.getPlan().isPaid()) {
            if (now.isBefore(s.getPaidUntil())) {
                return new Resolved(SubscriptionStatus.ACTIVE, s.getPlan());
            }
            if (now.isBefore(s.getPaidUntil().plusDays(GRACE_DAYS))) {
                return new Resolved(SubscriptionStatus.GRACE, s.getPlan());
            }
        }
        if (s.getTrialEndsAt() != null && now.isBefore(s.getTrialEndsAt())) {
            return new Resolved(SubscriptionStatus.TRIAL, SubscriptionPlan.PRO);
        }
        return new Resolved(SubscriptionStatus.FREE, SubscriptionPlan.FREE);
    }

    public record Resolved(SubscriptionStatus status, SubscriptionPlan plan) {
    }

    /** Active clients in "workable first" order: chosen-for-plan, then the earliest added. */
    @Transactional(readOnly = true)
    public List<TrainerClient> activeClients(Long trainerId) {
        return trainerClientRepository.findActiveByTrainerIdForPlan(trainerId);
    }

    /** Effective client limit; empty — no limit (billing off or unlimited plan). */
    public Optional<Integer> clientLimit(AppUser trainer) {
        if (!enabled) {
            return Optional.empty();
        }
        return Optional.ofNullable(resolve(getOrCreate(trainer), LocalDateTime.now()).plan().getClientLimit());
    }

    /** Before adding a new active client (manual creation, invite, restore from archive). */
    public void assertCanAddClient(AppUser trainer) {
        Optional<Integer> limit = clientLimit(trainer);
        if (limit.isEmpty()) {
            return;
        }
        if (activeClients(trainer.getId()).size() >= limit.get()) {
            throw new ApiException(
                    "SUBSCRIPTION_LIMIT",
                    "Достигнут лимит тарифа (активных клиентов: " + limit.get() + "). "
                            + "Перейдите на тариф побольше в разделе «Подписка» или перенесите клиента в архив"
            );
        }
    }

    /** Before creating a training / accepting a booking for this client. */
    public void assertClientWorkable(AppUser trainer, Long clientId) {
        Optional<Integer> limit = clientLimit(trainer);
        if (limit.isEmpty()) {
            return;
        }
        List<TrainerClient> active = activeClients(trainer.getId());
        boolean workable = active.stream()
                .limit(limit.get())
                .anyMatch(tc -> tc.getClient().getId().equals(clientId));
        if (!workable) {
            throw new ApiException(
                    "SUBSCRIPTION_LIMIT",
                    "Клиент вне лимита тарифа (рабочих клиентов на текущем тарифе: " + limit.get()
                            + "). Продлите подписку или выберите рабочих клиентов в разделе «Подписка»"
            );
        }
    }
}
