package ru.fitapp.backend.training.model;

import java.util.List;

public enum TrainingType {
    /** With the trainer, draws down the client's paid contract balance on completion. */
    PERSONAL,
    /** Self-guided, doesn't touch the contract balance. */
    INDEPENDENT,
    /** Circuit workout with the trainer: own title/description and numbered stations; draws from the contract like PERSONAL. */
    CIRCUIT;

    /** Types that consume one training from the client's paid contract when completed. */
    public static final List<TrainingType> CONTRACT_TYPES = List.of(PERSONAL, CIRCUIT);

    public boolean drawsFromContract() {
        return CONTRACT_TYPES.contains(this);
    }
}
