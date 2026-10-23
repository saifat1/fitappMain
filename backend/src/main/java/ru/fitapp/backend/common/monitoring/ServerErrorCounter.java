package ru.fitapp.backend.common.monitoring;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicLong;

/** Unhandled server errors (HTTP 500) since the backend started — the «Качество» part of the weekly metrics (FIT-72). */
@Component
public class ServerErrorCounter {

    private final AtomicLong errors = new AtomicLong();
    private final LocalDateTime startedAt = LocalDateTime.now();

    public void increment() {
        errors.incrementAndGet();
    }

    public long count() {
        return errors.get();
    }

    public LocalDateTime startedAt() {
        return startedAt;
    }
}
