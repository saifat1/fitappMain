package ru.fitapp.backend.contract.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.contract.entity.ClientContract;
import ru.fitapp.backend.contract.repository.ClientContractRepository;
import ru.fitapp.backend.notification.service.NotificationService;

import java.time.LocalDate;
import java.util.List;

/**
 * Daily check for contracts about to expire. Per the 13.07.2026 decision:
 * the trainer gets a heads-up ~10 days before the end date, and nothing
 * happens to the client automatically once it passes — this job only ever
 * sends a notification, it never touches the contract's balance or the
 * client's access.
 */
@Component
public class ContractExpiryNotificationJob {

    private static final Logger log = LoggerFactory.getLogger(ContractExpiryNotificationJob.class);
    private static final int DAYS_AHEAD = 10;

    private final ClientContractRepository clientContractRepository;
    private final NotificationService notificationService;

    public ContractExpiryNotificationJob(
            ClientContractRepository clientContractRepository,
            NotificationService notificationService
    ) {
        this.clientContractRepository = clientContractRepository;
        this.notificationService = notificationService;
    }

    // Every day at 09:00 server time. The lookup window (today..+10 days)
    // makes this safe to run at any cadence — a missed day just means the
    // heads-up arrives a bit later than exactly 10 days out, never sooner.
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void notifyExpiringContracts() {
        LocalDate today = LocalDate.now();
        LocalDate windowEnd = today.plusDays(DAYS_AHEAD);

        List<ClientContract> expiring = clientContractRepository
                .findAllByEndDateIsNotNullAndEndDateBetweenAndExpiryNotifiedFalse(today, windowEnd);

        for (ClientContract contract : expiring) {
            try {
                notificationService.notifyContractExpiring(contract);
                contract.setExpiryNotified(true);
                clientContractRepository.save(contract);
            } catch (Exception ex) {
                // One bad contract shouldn't stop the rest from being notified.
                log.error("Failed to send contract-expiry notification for contract {}: {}", contract.getId(), ex.getMessage());
            }
        }
    }
}
