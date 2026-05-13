package ru.fitapp.backend.analytics.service;

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

@Service
@Transactional(readOnly = true)
public class AnalyticsStatsService {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final TrainingRepository trainingRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public AnalyticsStatsService(
            AnalyticsEventRepository analyticsEventRepository,
            TrainingRepository trainingRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService
    ) {
        this.analyticsEventRepository = analyticsEventRepository;
        this.trainingRepository = trainingRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    public AnalyticsSummaryResponse getSummary(LocalDate from, LocalDate to) {
        checkAccess();

        DateRange range = resolveRange(from, to);

        LocalDateTime fromDateTime = range.from().atStartOfDay();
        LocalDateTime toDateTimeExclusive = range.to().plusDays(1).atStartOfDay();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime tomorrowStart = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);

        return new AnalyticsSummaryResponse()
                .setRangeFrom(range.from().toString())
                .setRangeTo(range.to().toString())

                .setTrainerLoginCount(countLogins(UserRole.TRAINER, fromDateTime, toDateTimeExclusive))
                .setClientLoginCount(countLogins(UserRole.CLIENT, fromDateTime, toDateTimeExclusive))

                .setTotalTrainings(trainingRepository.countByTrainingDateBetween(range.from(), range.to()))
                .setPlannedTrainings(trainingRepository.countByStatusAndTrainingDateBetween(
                        TrainingStatus.PLANNED,
                        range.from(),
                        range.to()
                ))
                .setCompletedTrainings(trainingRepository.countByStatusAndTrainingDateBetween(
                        TrainingStatus.COMPLETED,
                        range.from(),
                        range.to()
                ))

                .setActiveClientsRange(countActiveUsers(UserRole.CLIENT, fromDateTime, toDateTimeExclusive))
                .setActiveTrainersRange(countActiveUsers(UserRole.TRAINER, fromDateTime, toDateTimeExclusive))

                .setActiveClientsToday(countActiveUsers(UserRole.CLIENT, todayStart, tomorrowStart))
                .setActiveClientsWeek(countActiveUsers(UserRole.CLIENT, weekStart, LocalDateTime.now().plusSeconds(1)))
                .setActiveTrainersToday(countActiveUsers(UserRole.TRAINER, todayStart, tomorrowStart))
                .setActiveTrainersWeek(countActiveUsers(UserRole.TRAINER, weekStart, LocalDateTime.now().plusSeconds(1)))

                .setTopEvents(
                        analyticsEventRepository.findTopEventsBetween(
                                        fromDateTime,
                                        toDateTimeExclusive,
                                        PageRequest.of(0, 10)
                                )
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

    private void checkAccess() {
        AppUser currentUser = currentUserService.getCurrentUser();

        if (!currentUser.isAdmin()) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только администратору");
        }
    }

    private long countLogins(
            UserRole role,
            LocalDateTime from,
            LocalDateTime to
    ) {
        return analyticsEventRepository.countByEventTypeAndUserRoleAndOccurredAtGreaterThanEqualAndOccurredAtLessThan(
                AnalyticsEventType.USER_LOGIN_SUCCESS.name(),
                role.name(),
                from,
                to
        );
    }

    private long countActiveUsers(
            UserRole role,
            LocalDateTime from,
            LocalDateTime to
    ) {
        return analyticsEventRepository.countDistinctActiveUsersByRoleBetween(
                role.name(),
                from,
                to
        );
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

    private DateRange resolveRange(LocalDate from, LocalDate to) {
        LocalDate today = LocalDate.now();

        LocalDate resolvedFrom = from == null ? today.minusDays(6) : from;
        LocalDate resolvedTo = to == null ? today : to;

        if (resolvedFrom.isAfter(resolvedTo)) {
            throw new ApiException(
                    "INVALID_ANALYTICS_DATE_RANGE",
                    "Дата начала периода не может быть позже даты окончания"
            );
        }

        return new DateRange(resolvedFrom, resolvedTo);
    }

    private record DateRange(LocalDate from, LocalDate to) {
    }
}