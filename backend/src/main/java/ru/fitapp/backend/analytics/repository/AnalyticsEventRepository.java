package ru.fitapp.backend.analytics.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import ru.fitapp.backend.analytics.entity.AnalyticsEvent;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    long countByEventTypeAndUserRoleAndOccurredAtGreaterThanEqualAndOccurredAtLessThan(
            String eventType,
            String userRole,
            LocalDateTime from,
            LocalDateTime to
    );

    @Query("""
            select count(distinct e.user.id)
            from AnalyticsEvent e
            where e.userRole = :userRole
              and e.occurredAt >= :from
              and e.occurredAt < :to
            """)
    long countDistinctActiveUsersByRoleBetween(
            @Param("userRole") String userRole,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /** Visits = app opens and logins of users with the role in the period. */
    @Query("""
            select count(e.id)
            from AnalyticsEvent e
            where e.userRole = :userRole
              and e.eventType in :eventTypes
              and e.occurredAt >= :from
              and e.occurredAt < :to
            """)
    long countVisitsByRoleBetween(
            @Param("userRole") String userRole,
            @Param("eventTypes") List<String> eventTypes,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    /** Users of the role who came most often in the period: by days with visits, then by visits. */
    @Query("""
            select e.user.id as userId,
                   count(distinct cast(e.occurredAt as date)) as activeDays,
                   count(e.id) as visits
            from AnalyticsEvent e
            where e.userRole = :userRole
              and e.user is not null
              and e.eventType in :eventTypes
              and e.occurredAt >= :from
              and e.occurredAt < :to
            group by e.user.id
            order by count(distinct cast(e.occurredAt as date)) desc, count(e.id) desc
            """)
    List<UserVisitsView> findMostActiveUsersByRoleBetween(
            @Param("userRole") String userRole,
            @Param("eventTypes") List<String> eventTypes,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );

    interface UserVisitsView {
        Long getUserId();

        long getActiveDays();

        long getVisits();
    }

    @Query("""
            select e.eventType as eventType, count(e.id) as count
            from AnalyticsEvent e
            where e.occurredAt >= :from
              and e.occurredAt < :to
            group by e.eventType
            order by count(e.id) desc
            """)
    List<EventCountView> findTopEventsBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );

    interface EventCountView {
        String getEventType();

        long getCount();
    }
}