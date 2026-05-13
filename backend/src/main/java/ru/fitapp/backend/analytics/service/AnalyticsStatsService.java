package ru.fitapp.backend.analytics.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ru.fitapp.backend.analytics.dto.AnalyticsSummaryResponse;
import ru.fitapp.backend.analytics.model.AnalyticsEventType;
import ru.fitapp.backend.analytics.repository.AnalyticsEventRepository;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.user.model.UserStatus;
import ru.fitapp.backend.user.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsStatsService {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final Set<String> adminEmails;

    public AnalyticsStatsService(
            AnalyticsEventRepository analyticsEventRepository,
            TrainingRepository trainingRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService,
            @Value("${app.analytics.admin-emails:}") String adminEmailsRaw
    ) {
        this.analyticsEventRepository = analyticsEventRepository;
        this.trainingRepository = trainingRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.adminEmails = parseAdminEmails(adminEmailsRaw);
    }

    public AnalyticsSummaryResponse getSummary() {
        checkAccess();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);

        return new AnalyticsSummaryResponse()
                .setTrainerLoginCount(countLogins(UserRole.TRAINER))
                .setClientLoginCount(countLogins(UserRole.CLIENT))

                .setTotalTrainings(trainingRepository.count())
                .setPlannedTrainings(trainingRepository.countByStatus(TrainingStatus.PLANNED))
                .setCompletedTrainings(trainingRepository.countByStatus(TrainingStatus.COMPLETED))

                .setActiveClientsToday(countActiveUsers(UserRole.CLIENT, todayStart))
                .setActiveClientsWeek(countActiveUsers(UserRole.CLIENT, weekStart))
                .setActiveTrainersToday(countActiveUsers(UserRole.TRAINER, todayStart))
                .setActiveTrainersWeek(countActiveUsers(UserRole.TRAINER, weekStart))

                .setTopEvents(
                        analyticsEventRepository.findTopEvents(PageRequest.of(0, 10))
                                .stream()
                                .map(item -> new AnalyticsSummaryResponse.EventCountResponse(
                                        item.getEventType(),
                                        item.getCount()
                                ))
                                .toList()
                )

                .setInactiveUsers(
                        userRepository.findLeastActiveUsers(UserStatus.ACTIVE, PageRequest.of(0, 20))
                                .stream()
                                .map(this::mapInactiveUser)
                                .toList()
                );
    }

    private long countLogins(UserRole role) {
        return analyticsEventRepository.countByEventTypeAndUserRole(
                AnalyticsEventType.USER_LOGIN_SUCCESS.name(),
                role.name()
        );
    }

    private long countActiveUsers(UserRole role, LocalDateTime from) {
        return analyticsEventRepository.countDistinctActiveUsersByRoleSince(role.name(), from);
    }

    private AnalyticsSummaryResponse.InactiveUserResponse mapInactiveUser(AppUser user) {
        return new AnalyticsSummaryResponse.InactiveUserResponse()
                .setId(user.getId())
                .setEmail(user.getEmail())
                .setRole(user.getRole().name())
                .setFirstName(user.getFirstName())
                .setLastName(user.getLastName())
                .setLastLoginAt(user.getLastLoginAt())
                .setLastSeenAt(user.getLastSeenAt())
                .setLoginCount(user.getLoginCount());
    }

    private void checkAccess() {
        AppUser currentUser = currentUserService.getCurrentUser();

        if (adminEmails.isEmpty()) {
            throw new ApiException(
                    "ANALYTICS_ACCESS_NOT_CONFIGURED",
                    "Не настроен список пользователей с доступом к аналитике"
            );
        }

        String email = currentUser.getEmail() == null
                ? ""
                : currentUser.getEmail().trim().toLowerCase();

        if (!adminEmails.contains(email)) {
            throw new ApiException(
                    "ACCESS_DENIED",
                    "Нет доступа к аналитике"
            );
        }
    }

    private Set<String> parseAdminEmails(String value) {
        if (value == null || value.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(value.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(item -> !item.isBlank())
                .collect(Collectors.toSet());
    }
}