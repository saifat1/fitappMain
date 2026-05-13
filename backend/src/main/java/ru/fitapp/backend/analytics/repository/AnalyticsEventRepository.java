package ru.fitapp.backend.analytics.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import ru.fitapp.backend.analytics.entity.AnalyticsEvent;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEvent, Long> {

    long countByEventTypeAndUserRole(String eventType, String userRole);

    @Query("""
            select count(distinct e.user.id)
            from AnalyticsEvent e
            where e.userRole = :userRole
              and e.occurredAt >= :from
            """)
    long countDistinctActiveUsersByRoleSince(
            @Param("userRole") String userRole,
            @Param("from") LocalDateTime from
    );

    @Query("""
            select e.eventType as eventType, count(e.id) as count
            from AnalyticsEvent e
            group by e.eventType
            order by count(e.id) desc
            """)
    List<EventCountView> findTopEvents(Pageable pageable);

    interface EventCountView {
        String getEventType();
        long getCount();
    }
}