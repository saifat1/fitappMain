import type { TrainerDutySlotResponse } from "../../duty-slot/model/dutySlot.types";
import { getClientDisplayName, type TrainerAgendaRow } from "../lib/trainerCalendar";
import styles from "./CalendarDayAgenda.module.css";

type Props = {
    selectedDate: string;
    rows: TrainerAgendaRow[];
    processingTrainingId: number | null;
    processingDutyKey: string | null;
    dutySlotsByStartTime: Record<string, TrainerDutySlotResponse>;
    onOpenTraining: (trainingId: number) => void;
    onQuickAdd: (startTime?: string) => void;
    onCompleteTraining: (trainingId: number) => void;
    onCancelTraining: (trainingId: number) => void;
    onRescheduleTraining: (trainingId: number) => void;
    onCreateDutySlot: (startTime: string) => void;
    onDeleteDutySlot: (slotId: number, startTime: string) => void;
};

function formatDateTitle(value: string): string {
    return new Date(value).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function normalizeTime(value?: string | null): string {
    return value ? value.slice(0, 5) : "";
}

function getStatusLabel(status: string): string {
    switch (status) {
        case "PLANNED":
            return "Запланирована";
        case "COMPLETED":
            return "Завершена";
        case "CANCELLED":
            return "Отменена";
        default:
            return status;
    }
}

function getStatusClass(status: string): string {
    switch (status) {
        case "PLANNED":
            return `${styles.status} ${styles.statusPlanned}`;
        case "COMPLETED":
            return `${styles.status} ${styles.statusCompleted}`;
        case "CANCELLED":
            return `${styles.status} ${styles.statusCancelled}`;
        default:
            return styles.status;
    }
}

function getFreeMeta(row: TrainerAgendaRow): string {
    if (row.source === "EXCEPTION") {
        if (row.comment?.trim()) {
            return `Исключение · ${row.comment.trim()}`;
        }
        return "Исключение";
    }

    if (row.endTime) {
        return `${row.startTime}–${row.endTime}`;
    }

    return "Доступный слот";
}

function timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
}

function isEligibleForDuty(row: TrainerAgendaRow): boolean {
    if (!row.startTime || row.startTime === "Без времени") {
        return false;
    }

    if (!/^\d{2}:00$/.test(row.startTime)) {
        return false;
    }

    if (!row.endTime) {
        return false;
    }

    return timeToMinutes(row.endTime) - timeToMinutes(row.startTime) === 60;
}

export default function CalendarDayAgenda({
                                              selectedDate,
                                              rows,
                                              processingTrainingId,
                                              processingDutyKey,
                                              dutySlotsByStartTime,
                                              onOpenTraining,
                                              onQuickAdd,
                                              onCompleteTraining,
                                              onCancelTraining,
                                              onRescheduleTraining,
                                              onCreateDutySlot,
                                              onDeleteDutySlot,
                                          }: Props) {
    const busyCount = rows.filter((row) => row.state === "BUSY").length;
    const freeCount = rows.filter((row) => row.state === "FREE").length;

    return (
        <section className={styles.panel}>
            <div className={styles.header}>
                <h2 className={styles.title}>{formatDateTitle(selectedDate)}</h2>
                <div className={styles.subtitle}>
                    {rows.length === 0
                        ? "На выбранный день нет доступности и тренировок"
                        : `Свободных слотов: ${freeCount} · Тренировок: ${busyCount}`}
                </div>
            </div>

            {rows.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyTitle}>День пока пустой</div>
                    <div className={styles.emptyText}>
                        Нет ни доступных слотов, ни тренировок. Можно задать доступность или
                        создать тренировку вручную.
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={`dashboard-btn dashboard-btn-primary ${styles.openBtn}`}
                            onClick={() => onQuickAdd()}
                        >
                            Добавить тренировку
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.table}>
                    <div className={styles.head}>
                        <div>Время</div>
                        <div>Запись</div>
                    </div>

                    <div className={styles.body}>
                        {rows.map((row) => {
                            const dutySlot = dutySlotsByStartTime[row.startTime];
                            const dutyProcessingKey = `${selectedDate}-${row.startTime}`;
                            const isDutyBusy = processingDutyKey === dutyProcessingKey;
                            const canToggleDuty = isEligibleForDuty(row);

                            if (row.state === "FREE") {
                                return (
                                    <div
                                        key={row.key}
                                        className={`${styles.row} ${styles.rowFree}`}
                                    >
                                        <div className={styles.time}>{row.startTime}</div>

                                        <div className={styles.main}>
                                            <div className={styles.mainLeft}>
                                                <div className={styles.client}>Свободно</div>

                                                <div className={styles.metaRow}>
                                                    {row.endTime && (
                                                        <span className={`${styles.sourceBadge} ${styles.sourceBadgeRule}`}>
                              {row.startTime}–{row.endTime}
                            </span>
                                                    )}

                                                    <span
                                                        className={`${styles.sourceBadge} ${
                                                            row.source === "EXCEPTION"
                                                                ? styles.sourceBadgeException
                                                                : styles.sourceBadgeRule
                                                        }`}
                                                    >
                            {getFreeMeta(row)}
                          </span>

                                                    {dutySlot && (
                                                        <span className={`${styles.sourceBadge} ${styles.dutyBadge}`}>
                              Дежурство
                            </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.actions}>
                                                {canToggleDuty && (
                                                    <button
                                                        type="button"
                                                        className={`dashboard-btn dashboard-btn-secondary ${styles.dutyToggle} ${
                                                            dutySlot ? styles.dutyToggleActive : ""
                                                        }`}
                                                        onClick={() =>
                                                            dutySlot
                                                                ? onDeleteDutySlot(dutySlot.id, row.startTime)
                                                                : onCreateDutySlot(row.startTime)
                                                        }
                                                        disabled={isDutyBusy}
                                                        title={dutySlot ? "Снять дежурство" : "Отметить дежурство"}
                                                    >
                                                        <span className={styles.dutyToggleIcon}>◷</span>
                                                        <span className={styles.dutyToggleLabel}>
      {isDutyBusy ? "..." : "Деж."}
    </span>
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className={`dashboard-btn dashboard-btn-primary ${styles.openBtn}`}
                                                    onClick={() => onQuickAdd(row.startTime)}
                                                    title="Добавить тренировку"
                                                >
                                                    Добавить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            const training = row.training;
                            if (!training) {
                                return null;
                            }

                            const isBusy = processingTrainingId === training.id;

                            return (
                                <div
                                    key={row.key}
                                    className={`${styles.row} ${styles.rowBusy}`}
                                >
                                    <div className={styles.time}>{row.startTime}</div>

                                    <div className={styles.main}>
                                        <div className={styles.mainLeft}>
                                            <div className={styles.client}>
                                                {getClientDisplayName(training)}
                                            </div>

                                            <div className={styles.metaRow}>
                        <span className={`${styles.sourceBadge} ${styles.sourceBadgeRule}`}>
                          {training.endTime
                              ? `${row.startTime}–${normalizeTime(training.endTime)}`
                              : row.startTime}
                        </span>

                                                <span className={getStatusClass(training.status)}>
                          {getStatusLabel(training.status)}
                        </span>

                                                {row.source === "EXCEPTION" && (
                                                    <span className={`${styles.sourceBadge} ${styles.sourceBadgeException}`}>
                            Исключение
                          </span>
                                                )}

                                                {dutySlot && (
                                                    <span className={`${styles.sourceBadge} ${styles.dutyBadge}`}>
                            Дежурство
                          </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={styles.actions}>
                                            {canToggleDuty && (
                                                <button
                                                    type="button"
                                                    className={`dashboard-btn dashboard-btn-secondary ${styles.dutyToggle} ${
                                                        dutySlot ? styles.dutyToggleActive : ""
                                                    }`}
                                                    onClick={() =>
                                                        dutySlot
                                                            ? onDeleteDutySlot(dutySlot.id, row.startTime)
                                                            : onCreateDutySlot(row.startTime)
                                                    }
                                                    disabled={isDutyBusy}
                                                    title={dutySlot ? "Снять дежурство" : "Отметить дежурство"}
                                                >
                                                    <span className={styles.dutyToggleIcon}>◷</span>
                                                    <span className={styles.dutyToggleLabel}>
      {isDutyBusy ? "..." : "Деж."}
    </span>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className={`dashboard-btn dashboard-btn-secondary ${styles.openBtn}`}
                                                onClick={() => onOpenTraining(training.id)}
                                            >
                                                Открыть
                                            </button>

                                            {training.status === "PLANNED" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className={`dashboard-btn dashboard-btn-secondary ${styles.iconBtn} ${styles.completeBtn}`}
                                                        onClick={() => onCompleteTraining(training.id)}
                                                        disabled={isBusy}
                                                        title="Завершить тренировку"
                                                    >
                                                        ✓
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`dashboard-btn dashboard-btn-secondary ${styles.iconBtn} ${styles.rescheduleBtn}`}
                                                        onClick={() => onRescheduleTraining(training.id)}
                                                        disabled={isBusy}
                                                        title="Перенос тренировки"
                                                    >
                                                        ↔
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`dashboard-btn dashboard-btn-secondary ${styles.iconBtn} ${styles.cancelBtn}`}
                                                        onClick={() => onCancelTraining(training.id)}
                                                        disabled={isBusy}
                                                        title="Отменить тренировку"
                                                    >
                                                        ×
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}