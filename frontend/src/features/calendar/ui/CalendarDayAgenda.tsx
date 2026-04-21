import { getClientDisplayName, type TrainerAgendaRow } from "../lib/trainerCalendar";
import styles from "./CalendarDayAgenda.module.css";

type Props = {
    selectedDate: string;
    rows: TrainerAgendaRow[];
    processingTrainingId: number | null;
    onOpenTraining: (trainingId: number) => void;
    onQuickAdd: (startTime?: string) => void;
    onCompleteTraining: (trainingId: number) => void;
    onCancelTraining: (trainingId: number) => void;
    onRescheduleTraining: (trainingId: number) => void;
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

export default function CalendarDayAgenda({
                                              selectedDate,
                                              rows,
                                              processingTrainingId,
                                              onOpenTraining,
                                              onQuickAdd,
                                              onCompleteTraining,
                                              onCancelTraining,
                                              onRescheduleTraining,
                                          }: Props) {
    const busyCount = rows.filter((row) => row.state === "BUSY").length;
    const freeCount = rows.filter((row) => row.state === "FREE").length;

    return (
        <section className={styles.panel}>
            <div className={styles.header}>
                <h2 className={styles.title}>{formatDateTitle(selectedDate)}</h2>
                <p className={styles.subtitle}>
                    {rows.length === 0
                        ? "На выбранный день нет доступности и тренировок"
                        : `Свободных слотов: ${freeCount} · Тренировок: ${busyCount}`}
                </p>
            </div>

            {rows.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyTitle}>День пока пустой</div>
                    <div className={styles.emptyText}>
                        Нет ни доступных слотов, ни тренировок. Можно задать доступность или создать
                        тренировку вручную.
                    </div>
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-primary"
                        onClick={() => onQuickAdd()}
                    >
                        Добавить тренировку
                    </button>
                </div>
            ) : (
                <div className={styles.table}>
                    <div className={styles.head}>
                        <div>Время</div>
                        <div>Запись</div>
                    </div>

                    <div className={styles.body}>
                        {rows.map((row) => {
                            if (row.state === "FREE") {
                                return (
                                    <div key={row.key} className={`${styles.row} ${styles.rowFree}`}>
                                        <div className={styles.time}>{row.startTime}</div>

                                        <div className={styles.main}>
                                            <div className={styles.mainLeft}>
                                                <div className={styles.emptyTitle}>Свободно</div>
                                                <div className={styles.metaRow}>
                                                    {row.endTime && (
                                                        <span className={styles.meta}>
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
                                                </div>
                                            </div>

                                            <div className={styles.actions}>
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
                                <div key={row.key} className={`${styles.row} ${styles.rowBusy}`}>
                                    <div className={styles.time}>{row.startTime}</div>

                                    <div className={styles.main}>
                                        <div className={styles.mainLeft}>
                                            <div className={styles.client}>{getClientDisplayName(training)}</div>

                                            <div className={styles.metaRow}>
                        <span className={styles.meta}>
                          {training.endTime
                              ? `${row.startTime}–${normalizeTime(training.endTime)}`
                              : row.startTime}
                        </span>
                                                <span className={getStatusClass(training.status)}>
                          {getStatusLabel(training.status)}
                        </span>
                                                {row.source === "EXCEPTION" && (
                                                    <span
                                                        className={`${styles.sourceBadge} ${styles.sourceBadgeException}`}
                                                    >
                            Исключение
                          </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className={styles.actions}>
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