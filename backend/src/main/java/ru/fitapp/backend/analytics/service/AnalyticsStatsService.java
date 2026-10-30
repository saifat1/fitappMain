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
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsStatsService {

    /** A visit to the app: opening it (once per page load) or signing in. */
    private static final List<String> VISIT_EVENTS = List.of(
            AnalyticsEventType.APP_OPENED.name(),
            AnalyticsEventType.USER_LOGIN_SUCCESS.name()
    );

    private static final int USER_LIST_SIZE = 20;

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

                .setTrainerVisits(countVisits(UserRole.TRAINER, fromDateTime, toDateTimeExclusive))
                .setClientVisits(countVisits(UserRole.CLIENT, fromDateTime, toDateTimeExclusive))

                .setMostActiveTrainers(findMostActive(UserRole.TRAINER, fromDateTime, toDateTimeExclusive))
                .setMostActiveClients(findMostActive(UserRole.CLIENT, fromDateTime, toDateTimeExclusive))
                .setLeastActiveTrainers(findLeastActive(UserRole.TRAINER))
                .setLeastActiveClients(findLeastActive(UserRole.CLIENT));
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

    private long countVisits(
            UserRole role,
            LocalDateTime from,
            LocalDateTime to
    ) {
        return analyticsEventRepository.countVisitsByRoleBetween(role.name(), VISIT_EVENTS, from, to);
    }

    private List<AnalyticsSummaryResponse.UserActivityResponse> findMostActive(
            UserRole role,
            LocalDateTime from,
            LocalDateTime to
    ) {
        List<AnalyticsEventRepository.UserVisitsView> rows = analyticsEventRepository.findMostActiveUsersByRoleBetween(
                role.name(),
                VISIT_EVENTS,
                from,
                to,
                PageRequest.of(0, USER_LIST_SIZE)
        );

        Map<Long, AppUser> users = userRepository.findAllById(
                        rows.stream().map(AnalyticsEventRepository.UserVisitsView::getUserId).toList()
                )
                .stream()
                .collect(Collectors.toMap(AppUser::getId, Function.identity()));

        return rows.stream()
                .filter(row -> users.containsKey(row.getUserId()))
                .map(row -> mapUser(users.get(row.getUserId()))
                        .setPeriodActiveDays(row.getActiveDays())
                        .setPeriodVisits(row.getVisits()))
                .toList();
    }

    private List<AnalyticsSummaryResponse.UserActivityResponse> findLeastActive(UserRole role) {
        return userRepository.findLeastActiveUsers(UserStatus.ACTIVE, role, PageRequest.of(0, USER_LIST_SIZE))
                .stream()
                .map(this::mapUser)
                .toList();
    }

    private AnalyticsSummaryResponse.UserActivityResponse mapUser(AppUser user) {
        return new AnalyticsSummaryResponse.UserActivityResponse()
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