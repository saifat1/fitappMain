package ru.fitapp.backend.analytics.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AnalyticsSummaryResponse {

    private long trainerLoginCount;
    private long clientLoginCount;

    private long totalTrainings;
    private long plannedTrainings;
    private long completedTrainings;

    private long activeClientsToday;
    private long activeClientsWeek;
    private long activeTrainersToday;
    private long activeTrainersWeek;

    private String rangeFrom;
    private String rangeTo;

    private long activeClientsRange;
    private long activeTrainersRange;

    private List<EventCountResponse> topEvents;

    // Visits = app opens and logins in the period; unique users are activeTrainersRange / activeClientsRange.
    private long trainerVisits;
    private long clientVisits;

    // Who came most often in the period / who hasn't come for the longest time (any period), per role.
    private List<UserActivityResponse> mostActiveTrainers;
    private List<UserActivityResponse> mostActiveClients;
    private List<UserActivityResponse> leastActiveTrainers;
    private List<UserActivityResponse> leastActiveClients;

    public long getTrainerLoginCount() {
        return trainerLoginCount;
    }

    public AnalyticsSummaryResponse setTrainerLoginCount(long trainerLoginCount) {
        this.trainerLoginCount = trainerLoginCount;
        return this;
    }

    public long getClientLoginCount() {
        return clientLoginCount;
    }

    public AnalyticsSummaryResponse setClientLoginCount(long clientLoginCount) {
        this.clientLoginCount = clientLoginCount;
        return this;
    }

    public long getTotalTrainings() {
        return totalTrainings;
    }

    public AnalyticsSummaryResponse setTotalTrainings(long totalTrainings) {
        this.totalTrainings = totalTrainings;
        return this;
    }

    public long getPlannedTrainings() {
        return plannedTrainings;
    }

    public AnalyticsSummaryResponse setPlannedTrainings(long plannedTrainings) {
        this.plannedTrainings = plannedTrainings;
        return this;
    }

    public long getCompletedTrainings() {
        return completedTrainings;
    }

    public AnalyticsSummaryResponse setCompletedTrainings(long completedTrainings) {
        this.completedTrainings = completedTrainings;
        return this;
    }

    public long getActiveClientsToday() {
        return activeClientsToday;
    }

    public AnalyticsSummaryResponse setActiveClientsToday(long activeClientsToday) {
        this.activeClientsToday = activeClientsToday;
        return this;
    }

    public String getRangeFrom() {
        return rangeFrom;
    }

    public AnalyticsSummaryResponse setRangeFrom(String rangeFrom) {
        this.rangeFrom = rangeFrom;
        return this;
    }

    public String getRangeTo() {
        return rangeTo;
    }

    public AnalyticsSummaryResponse setRangeTo(String rangeTo) {
        this.rangeTo = rangeTo;
        return this;
    }

    public long getActiveClientsRange() {
        return activeClientsRange;
    }

    public AnalyticsSummaryResponse setActiveClientsRange(long activeClientsRange) {
        this.activeClientsRange = activeClientsRange;
        return this;
    }

    public long getActiveTrainersRange() {
        return activeTrainersRange;
    }

    public AnalyticsSummaryResponse setActiveTrainersRange(long activeTrainersRange) {
        this.activeTrainersRange = activeTrainersRange;
        return this;
    }

    public long getActiveClientsWeek() {
        return activeClientsWeek;
    }

    public AnalyticsSummaryResponse setActiveClientsWeek(long activeClientsWeek) {
        this.activeClientsWeek = activeClientsWeek;
        return this;
    }

    public long getActiveTrainersToday() {
        return activeTrainersToday;
    }

    public AnalyticsSummaryResponse setActiveTrainersToday(long activeTrainersToday) {
        this.activeTrainersToday = activeTrainersToday;
        return this;
    }

    public long getActiveTrainersWeek() {
        return activeTrainersWeek;
    }

    public AnalyticsSummaryResponse setActiveTrainersWeek(long activeTrainersWeek) {
        this.activeTrainersWeek = activeTrainersWeek;
        return this;
    }

    public List<EventCountResponse> getTopEvents() {
        return topEvents;
    }

    public AnalyticsSummaryResponse setTopEvents(List<EventCountResponse> topEvents) {
        this.topEvents = topEvents;
        return this;
    }

    public long getTrainerVisits() {
        return trainerVisits;
    }

    public AnalyticsSummaryResponse setTrainerVisits(long trainerVisits) {
        this.trainerVisits = trainerVisits;
        return this;
    }

    public long getClientVisits() {
        return clientVisits;
    }

    public AnalyticsSummaryResponse setClientVisits(long clientVisits) {
        this.clientVisits = clientVisits;
        return this;
    }

    public List<UserActivityResponse> getMostActiveTrainers() {
        return mostActiveTrainers;
    }

    public AnalyticsSummaryResponse setMostActiveTrainers(List<UserActivityResponse> mostActiveTrainers) {
        this.mostActiveTrainers = mostActiveTrainers;
        return this;
    }

    public List<UserActivityResponse> getMostActiveClients() {
        return mostActiveClients;
    }

    public AnalyticsSummaryResponse setMostActiveClients(List<UserActivityResponse> mostActiveClients) {
        this.mostActiveClients = mostActiveClients;
        return this;
    }

    public List<UserActivityResponse> getLeastActiveTrainers() {
        return leastActiveTrainers;
    }

    public AnalyticsSummaryResponse setLeastActiveTrainers(List<UserActivityResponse> leastActiveTrainers) {
        this.leastActiveTrainers = leastActiveTrainers;
        return this;
    }

    public List<UserActivityResponse> getLeastActiveClients() {
        return leastActiveClients;
    }

    public AnalyticsSummaryResponse setLeastActiveClients(List<UserActivityResponse> leastActiveClients) {
        this.leastActiveClients = leastActiveClients;
        return this;
    }

    public static class EventCountResponse {

        private String eventType;
        private long count;

        public EventCountResponse(String eventType, long count) {
            this.eventType = eventType;
            this.count = count;
        }

        public String getEventType() {
            return eventType;
        }

        public long getCount() {
            return count;
        }
    }

    public static class UserActivityResponse {

        private Long id;
        private String email;
        private String role;
        private String firstName;
        private String lastName;
        private LocalDateTime lastLoginAt;
        private LocalDateTime lastSeenAt;
        private Long loginCount;
        // Only in the «most active» lists: days with visits and visits in the period.
        private Long periodActiveDays;
        private Long periodVisits;

        public Long getId() {
            return id;
        }

        public UserActivityResponse setId(Long id) {
            this.id = id;
            return this;
        }

        public String getEmail() {
            return email;
        }

        public UserActivityResponse setEmail(String email) {
            this.email = email;
            return this;
        }

        public String getRole() {
            return role;
        }

        public UserActivityResponse setRole(String role) {
            this.role = role;
            return this;
        }

        public String getFirstName() {
            return firstName;
        }

        public UserActivityResponse setFirstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public String getLastName() {
            return lastName;
        }

        public UserActivityResponse setLastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public LocalDateTime getLastLoginAt() {
            return lastLoginAt;
        }

        public UserActivityResponse setLastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
            return this;
        }

        public LocalDateTime getLastSeenAt() {
            return lastSeenAt;
        }

        public UserActivityResponse setLastSeenAt(LocalDateTime lastSeenAt) {
            this.lastSeenAt = lastSeenAt;
            return this;
        }

        public Long getLoginCount() {
            return loginCount;
        }

        public UserActivityResponse setLoginCount(Long loginCount) {
            this.loginCount = loginCount;
            return this;
        }

        public Long getPeriodActiveDays() {
            return periodActiveDays;
        }

        public UserActivityResponse setPeriodActiveDays(Long periodActiveDays) {
            this.periodActiveDays = periodActiveDays;
            return this;
        }

        public Long getPeriodVisits() {
            return periodVisits;
        }

        public UserActivityResponse setPeriodVisits(Long periodVisits) {
            this.periodVisits = periodVisits;
            return this;
        }
    }
}