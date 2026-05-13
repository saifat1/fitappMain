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