import type { TrainingResponse } from "../../training/model/training.types";
import { getClientDisplayName } from "../lib/trainerCalendar";

type Props = {
    selectedDate: string;
    hourSlots: string[];
    trainings: TrainingResponse[];
    onOpenTraining: (trainingId: number) => void;
    onQuickAdd: (startTime?: string) => void;
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
            return "coach-agenda-v2-status coach-agenda-v2-status--planned";
        case "COMPLETED":
            return "coach-agenda-v2-status coach-agenda-v2-status--completed";
        case "CANCELLED":
            return "coach-agenda-v2-status coach-agenda-v2-status--cancelled";
        default:
            return "coach-agenda-v2-status";
    }
}

export default function CalendarDayAgenda({
                                              selectedDate,
                                              hourSlots,
                                              trainings,
                                              onOpenTraining,
                                              onQuickAdd,
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
        <section className="coach-calendar-panel coach-agenda-v2-panel">
            <div className="coach-agenda-v2-header">
                <div>
                    <h2 className="coach-agenda-v2-title">{formatDateTitle(selectedDate)}</h2>
                    <div className="coach-agenda-v2-subtitle">
                        {trainings.length > 0
                            ? `Записей на день: ${trainings.length}`
                            : "На выбранный день записей нет"}
                    </div>
                </div>
            </div>

            <div className="coach-agenda-v2-table">
                <div className="coach-agenda-v2-head">
                    <div className="coach-agenda-v2-head-time">Время</div>
                    <div className="coach-agenda-v2-head-main">Запись</div>
                </div>

                <div className="coach-agenda-v2-body">
                    {hourSlots.map((slot) => {
                        const slotTrainings = byHour[slot] ?? [];

                        if (slotTrainings.length === 0) {
                            return (
                                <div key={slot} className="coach-agenda-v2-row coach-agenda-v2-row--empty">
                                    <div className="coach-agenda-v2-time">{slot}</div>

                                    <div className="coach-agenda-v2-main">
                                        <div className="coach-agenda-v2-main-left">
                                            <div className="coach-agenda-v2-empty-title">Свободно</div>
                                            <div className="coach-agenda-v2-meta">Нет записи на этот час</div>
                                        </div>

                                        <button
                                            type="button"
                                            className="coach-calendar-v2-icon-btn"
                                            onClick={() => onQuickAdd(slot)}
                                            title="Добавить тренировку"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        return slotTrainings.map((training) => (
                            <div key={training.id} className="coach-agenda-v2-row">
                                <div className="coach-agenda-v2-time">{slot}</div>

                                <div className="coach-agenda-v2-main">
                                    <div className="coach-agenda-v2-main-left">
                                        <div className="coach-agenda-v2-client">
                                            {getClientDisplayName(training)}
                                        </div>

                                        <div className="coach-agenda-v2-meta-row">
                      <span className="coach-agenda-v2-meta">
                        {training.endTime
                            ? `${slot}–${normalizeTime(training.endTime)}`
                            : slot}
                      </span>

                                            <span className={getStatusClass(training.status)}>
                        {getStatusLabel(training.status)}
                      </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="coach-calendar-v2-open-btn"
                                        onClick={() => onOpenTraining(training.id)}
                                    >
                                        Открыть
                                    </button>
                                </div>
                            </div>
                        ));
                    })}
                </div>
            </div>
        </section>
    );
}