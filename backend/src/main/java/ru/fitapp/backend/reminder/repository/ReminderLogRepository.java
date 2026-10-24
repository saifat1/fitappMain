package ru.fitapp.backend.reminder.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.reminder.entity.ReminderLog;

import java.time.LocalDateTime;

public interface ReminderLogRepository extends JpaRepository<ReminderLog, Long> {

    boolean existsByKindAndRefIdAndSlot(ReminderLog.Kind kind, Long refId, LocalDateTime slot);
}
