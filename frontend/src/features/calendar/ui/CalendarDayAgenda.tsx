import type { TrainingResponse } from "../../training/model/training.types";
import { getClientDisplayName } from "../lib/trainerCalendar";
import styles from "./CalendarDayAgenda.module.css";

type Props = {
    selectedDate: string;
    hourSlots: string[];
    trainings: TrainingResponse[];
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
    if (!value) {
        return "";
    }

    return value.slice(0, 5);
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

export default function CalendarDayAgenda({
                                              selectedDate,
                                              hourSlots,
                                              trainings,
                                              processingTrainingId,
                                              onOpenTraining,
                                              onQuickAdd,
                                              onCompleteTraining,
                                              onCancelTraining,
                                              onRescheduleTraining,
                                          }: Props) {
    const byHour = trainings.reduce<Record<string, TrainingResponse[]>>((acc, item) => {
        const key = normalizeTime(item.startTime) || "Без времени";
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});

    return (
        <section className={styles.panel}>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>{formatDateTitle(selectedDate)}</h2>
                    <div className={styles.subtitle}>
                        {trainings.length > 0
                            ? `Записей на день: ${trainings.length}`
                            : "На выбранный день записей нет"}
                    </div>
                </div>
            </div>

            <div className={styles.table}>
                <div className={styles.head}>
                    <div>Время</div>
                    <div>Запись</div>
                </div>

                <div className={styles.body}>
                    {hourSlots.map((slot) => {
                        const slotTrainings = byHour[slot] ?? [];

                        if (slotTrainings.length === 0) {
                            return (
                                <div key={slot} className={`${styles.row} ${styles.rowEmpty}`}>
                                    <div className={styles.time}>{slot}</div>

                                    <div className={styles.main}>
                                        <div className={styles.mainLeft}>
                                            <div className={styles.emptyTitle}>Свободно</div>
                                            <div className={styles.meta}>Нет записи на этот час</div>
                                        </div>

                                        <button
                                            type="button"
                                            className={`dashboard-btn dashboard-btn-secondary ${styles.iconBtn} ${styles.addBtn}`}
                                            onClick={() => onQuickAdd(slot)}
                                            title="Добавить тренировку"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return slotTrainings.map((training) => {
                            const isBusy = processingTrainingId === training.id;

                            return (
                                <div key={training.id} className={styles.row}>
                                    <div className={styles.time}>{slot}</div>

                                    <div className={styles.main}>
                                        <div className={styles.mainLeft}>
                                            <div className={styles.client}>
                                                {getClientDisplayName(training)}
                                            </div>

                                            <div className={styles.metaRow}>
                        <span className={styles.meta}>
                          {training.endTime
                              ? `${slot}–${normalizeTime(training.endTime)}`
                              : slot}
                        </span>

                                                <span className={getStatusClass(training.status)}>
                          {getStatusLabel(training.status)}
                        </span>
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
                        });
                    })}
                </div>
            </div>
        </section>
    );
}