package ru.fitapp.backend.training.model;

public enum TrainingType {
    /** With the trainer, draws down the client's paid contract balance on completion. */
    PERSONAL,
    /** Self-guided, doesn't touch the contract balance. */
    INDEPENDENT,
    /** Circuit workout: has its own title/description and numbered stations; doesn't touch the contract balance (yet). */
    CIRCUIT
}
