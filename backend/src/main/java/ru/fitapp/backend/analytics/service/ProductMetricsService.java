package ru.fitapp.backend.analytics.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.monitoring.ServerErrorCounter;

import java.sql.Timestamp;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Product metrics for a period (FIT-72): acquisition, activation, retention, usage, money, quality.
 * Counted from the domain tables (users, trainings, contracts, payments) plus analytics_event for activity,
 * so history before this feature is included. Used by the admin «Аналитика» screen and the weekly report.
 */
@Service
@Transactional(readOnly = true)
public class ProductMetricsService {

    /** A trainer «activated» if they did it within this many days after registration. */
    private static final int ACTIVATION_DAYS = 7;
    private static final int COHORT_WEEKS = 12;

    private final JdbcTemplate jdbc;
    private final ServerErrorCounter serverErrorCounter;

    public ProductMetricsService(JdbcTemplate jdbc, ServerErrorCounter serverErrorCounter) {
        this.jdbc = jdbc;
        this.serverErrorCounter = serverErrorCounter;
    }

    public Map<String, Object> compute(LocalDate from, LocalDate to) {
        Timestamp start = Timestamp.valueOf(from.atStartOfDay());
        Timestamp end = Timestamp.valueOf(to.plusDays(1).atStartOfDay());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("from", from.toString());
        result.put("to", to.toString());
        result.put("generatedAt", LocalDateTime.now().toString());
        result.put("acquisition", acquisition(start, end));
        result.put("activation", activation(start, end));
        result.put("retention", retention(to));
        result.put("usage", usage(start, end, from, to));
        result.put("money", money(start, end));
        result.put("quality", quality(start, end));
        result.put("totals", totals());
        return result;
    }

    private Map<String, Object> acquisition(Timestamp start, Timestamp end) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("trainersRegistered", count("""
                select count(*) from app_user
                where role = 'TRAINER' and status <> 'DELETED' and created_at >= ? and created_at < ?
                """, start, end));
        m.put("clientsRegistered", count("""
                select count(*) from app_user
                where role = 'CLIENT' and claimed_by_client and claimed_at >= ? and claimed_at < ?
                """, start, end));
        m.put("clientsAddedByTrainers", count("""
                select count(*) from trainer_client where created_at >= ? and created_at < ?
                """, start, end));
        m.put("trainersBySource", jdbc.queryForList("""
                select coalesce(signup_source, 'не указан') as source, count(*) as count from app_user
                where role = 'TRAINER' and status <> 'DELETED' and created_at >= ? and created_at < ?
                group by 1 order by 2 desc
                """, start, end));
        return m;
    }

    private Map<String, Object> activation(Timestamp start, Timestamp end) {
        String cohort = """
                from app_user u
                where u.role = 'TRAINER' and u.status <> 'DELETED' and u.created_at >= ? and u.created_at < ?
                """;
        String within = "u.created_at + interval '" + ACTIVATION_DAYS + " days'";
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("days", ACTIVATION_DAYS);
        m.put("registered", count("select count(*) " + cohort, start, end));
        m.put("addedClient", count("select count(*) " + cohort
                + " and exists (select 1 from trainer_client tc where tc.trainer_id = u.id and tc.created_at <= " + within + ")", start, end));
        m.put("createdTraining", count("select count(*) " + cohort
                + " and exists (select 1 from training t where t.trainer_id = u.id and t.created_at <= " + within + ")", start, end));
        m.put("completedTraining", count("select count(*) " + cohort
                + " and exists (select 1 from training t where t.trainer_id = u.id and t.status = 'COMPLETED' and t.updated_at <= "
                + within + ")", start, end));
        return m;
    }

    /** Weekly cohorts of new trainers: how many were active 1, 4 and 12 weeks later (null — that week hasn't come yet). */
    private List<Map<String, Object>> retention(LocalDate to) {
        LocalDate lastWeek = to.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = COHORT_WEEKS - 1; i >= 0; i--) {
            LocalDate week = lastWeek.minusWeeks(i);
            Timestamp ws = Timestamp.valueOf(week.atStartOfDay());
            Timestamp we = Timestamp.valueOf(week.plusWeeks(1).atStartOfDay());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("weekStart", week.toString());
            row.put("registered", count("""
                    select count(*) from app_user where role = 'TRAINER' and status <> 'DELETED' and created_at >= ? and created_at < ?
                    """, ws, we));
            for (int offset : new int[]{1, 4, 12}) {
                LocalDate activeWeek = week.plusWeeks(offset);
                if (activeWeek.plusWeeks(1).isAfter(today)) {
                    row.put("activeWeek" + offset, null);
                    continue;
                }
                row.put("activeWeek" + offset, count("""
                        select count(*) from app_user u
                        where u.role = 'TRAINER' and u.status <> 'DELETED' and u.created_at >= ? and u.created_at < ?
                          and exists (select 1 from analytics_event e where e.user_id = u.id and e.occurred_at >= ? and e.occurred_at < ?)
                        """, ws, we,
                        Timestamp.valueOf(activeWeek.atStartOfDay()), Timestamp.valueOf(activeWeek.plusWeeks(1).atStartOfDay())));
            }
            rows.add(row);
        }
        return rows;
    }

    private Map<String, Object> usage(Timestamp start, Timestamp end, LocalDate from, LocalDate to) {
        Map<String, Object> m = new LinkedHashMap<>();
        long activeTrainers = count("""
                select count(distinct user_id) from analytics_event where user_role = 'TRAINER' and occurred_at >= ? and occurred_at < ?
                """, start, end);
        long completed = count("""
                select count(*) from training where status = 'COMPLETED' and training_date >= ? and training_date <= ?
                """, java.sql.Date.valueOf(from), java.sql.Date.valueOf(to));
        m.put("activeTrainers", activeTrainers);
        m.put("activeClients", count("""
                select count(distinct user_id) from analytics_event where user_role = 'CLIENT' and occurred_at >= ? and occurred_at < ?
                """, start, end));
        m.put("trainingsCreated", count("select count(*) from training where created_at >= ? and created_at < ?", start, end));
        m.put("trainingsCompleted", completed);
        m.put("trainingsCompletedPerActiveTrainer", activeTrainers == 0 ? 0 : Math.round(completed * 10.0 / activeTrainers) / 10.0);
        m.put("trainingsByType", jdbc.queryForList("""
                select training_type as type, count(*) as count from training
                where status = 'COMPLETED' and training_date >= ? and training_date <= ? group by 1 order by 2 desc
                """, java.sql.Date.valueOf(from), java.sql.Date.valueOf(to)));
        m.put("trainingsCancelled", count("""
                select count(*) from training where status = 'CANCELLED' and updated_at >= ? and updated_at < ?
                """, start, end));
        m.put("bookingRequests", count("select count(*) from booking_request where created_at >= ? and created_at < ?", start, end));
        m.put("bookingRequestsApproved", count("""
                select count(*) from booking_request where status = 'APPROVED' and created_at >= ? and created_at < ?
                """, start, end));
        m.put("contractsCreated", count("select count(*) from client_contract where created_at >= ? and created_at < ?", start, end));
        m.put("feedbackReceived", count("select count(*) from feedback where created_at >= ? and created_at < ?", start, end));
        m.put("appDevicesWithPush", count("select count(*) from device_push_token"));
        // FIT-75: reminders to clients before trainings (evening before + ~2 hours before)
        m.put("remindersSent", count("select count(*) from reminder_log where kind in ('CLIENT_EVENING', 'CLIENT_SOON') and sent_at >= ? and sent_at < ?", start, end));
        return m;
    }

    private Map<String, Object> money(Timestamp start, Timestamp end) {
        Map<String, Object> m = new LinkedHashMap<>();
        Long revenueKopecks = jdbc.queryForObject("""
                select coalesce(sum(amount_kopecks), 0) from subscription_payment where status = 'SUCCEEDED' and paid_at >= ? and paid_at < ?
                """, Long.class, start, end);
        m.put("revenueRub", revenueKopecks == null ? 0 : revenueKopecks / 100.0);
        m.put("paymentsSucceeded", count("""
                select count(*) from subscription_payment where status = 'SUCCEEDED' and paid_at >= ? and paid_at < ?
                """, start, end));
        m.put("renewalsSucceeded", count("""
                select count(*) from subscription_payment where status = 'SUCCEEDED' and purpose = 'RENEWAL' and paid_at >= ? and paid_at < ?
                """, start, end));
        m.put("paymentsFailed", count("""
                select count(*) from subscription_payment where status = 'FAILED' and created_at >= ? and created_at < ?
                """, start, end));
        m.put("newPayingTrainers", count("""
                select count(*) from (
                  select trainer_id, min(paid_at) as first_paid from subscription_payment where status = 'SUCCEEDED' group by trainer_id
                ) p where p.first_paid >= ? and p.first_paid < ?
                """, start, end));
        m.put("activePaidNow", count("select count(*) from trainer_subscription where paid_until > now()"));
        m.put("inTrialNow", count("""
                select count(*) from trainer_subscription where trial_ends_at > now() and (paid_until is null or paid_until <= now())
                """));
        m.put("autoRenewOffNow", count("select count(*) from trainer_subscription where paid_until > now() and not auto_renew"));
        m.put("byPlan", jdbc.queryForList("""
                select plan, count(*) as count from trainer_subscription where paid_until > now() group by 1 order by 2 desc
                """));
        return m;
    }

    private Map<String, Object> quality(Timestamp start, Timestamp end) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("serverErrorsSinceStart", serverErrorCounter.count());
        m.put("backendStartedAt", serverErrorCounter.startedAt().toString());
        m.put("paymentsFailed", count("""
                select count(*) from subscription_payment where status = 'FAILED' and created_at >= ? and created_at < ?
                """, start, end));
        return m;
    }

    private Map<String, Object> totals() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("trainers", count("select count(*) from app_user where role = 'TRAINER' and status <> 'DELETED'"));
        m.put("clients", count("select count(*) from app_user where role = 'CLIENT' and status = 'ACTIVE'"));
        m.put("clientsRegistered", count("select count(*) from app_user where role = 'CLIENT' and status = 'ACTIVE' and claimed_by_client"));
        m.put("trainingsCompleted", count("select count(*) from training where status = 'COMPLETED'"));
        return m;
    }

    private long count(String sql, Object... args) {
        Long value = jdbc.queryForObject(sql, Long.class, args);
        return value == null ? 0 : value;
    }
}
