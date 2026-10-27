package ru.fitapp.backend.reminder.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/** A reminder that has been sent (FIT-75) — kind + training/trainer id + slot is unique. */
@Entity
@Table(name = "reminder_log")
public class ReminderLog {

    public enum Kind {
        /** Client, the evening before (19:00). */
        CLIENT_EVENING,
        /** Client, ~2 hours before. */
        CLIENT_SOON,
        /** Trainer, the morning summary of the day (08:00). */
        TRAINER_DAY,
        /** Trainer, 3 days before the paid period ends — slot = paid_until (FIT-79). */
        SUBSCRIPTION_END,
        /** Trainer, 3 days before the free trial ends — slot = trial_ends_at. */
        TRIAL_END
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 32)
    private Kind kind;

    @Column(name = "ref_id", nullable = false)
    private Long refId;

    @Column(name = "slot", nullable = false)
    private LocalDateTime slot;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    protected ReminderLog() {
    }

    public ReminderLog(Kind kind, Long refId, LocalDateTime slot) {
        this.kind = kind;
        this.refId = refId;
        this.slot = slot;
        this.sentAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Kind getKind() {
        return kind;
    }

    public Long getRefId() {
        return refId;
    }

    public LocalDateTime getSlot() {
        return slot;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }
}
