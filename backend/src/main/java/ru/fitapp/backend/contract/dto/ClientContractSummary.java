package ru.fitapp.backend.contract.dto;

public class ClientContractSummary {

    private final boolean hasContracts;
    private final int totalRemainingTrainings;
    private final int plannedCount;

    public ClientContractSummary(boolean hasContracts, int totalRemainingTrainings, int plannedCount) {
        this.hasContracts = hasContracts;
        this.totalRemainingTrainings = totalRemainingTrainings;
        this.plannedCount = plannedCount;
    }

    public boolean isHasContracts() {
        return hasContracts;
    }

    /** Balance left on the contract(s) after completed trainings only — the raw number shown in the client profile. */
    public int getTotalRemainingTrainings() {
        return totalRemainingTrainings;
    }

    /** How many upcoming (PLANNED) trainings already exist for this client — each will draw down the balance once conducted. */
    public int getPlannedCount() {
        return plannedCount;
    }

    /**
     * What's actually free to book once already-scheduled trainings are
     * accounted for. Without this, a client with 1 remaining training could
     * end up with 10 PLANNED sessions on the calendar before anyone notices
     * the contract can't cover them — the shortfall only became visible one
     * completion at a time.
     */
    public int getEffectivelyAvailable() {
        return totalRemainingTrainings - plannedCount;
    }

    /** True only once the client has at least one contract and it can't cover what's already on the calendar. */
    public boolean isExhausted() {
        return hasContracts && getEffectivelyAvailable() <= 0;
    }
}
