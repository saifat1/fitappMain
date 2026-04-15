import type { FormEvent } from "react";
import type { TrainingViewMode } from "../lib/trainingView";

type Props = {
    viewMode: TrainingViewMode;
    draftFrom: string;
    draftTo: string;
    isLoading: boolean;
    onSelectToday: () => void;
    onSelectWeek: () => void;
    onSelectRange: () => void;
    onChangeDraftFrom: (value: string) => void;
    onChangeDraftTo: (value: string) => void;
    onApplyRange: (event: FormEvent<HTMLFormElement>) => void;
};

export default function TrainingQuickFilters({
                                                 viewMode,
                                                 draftFrom,
                                                 draftTo,
                                                 isLoading,
                                                 onSelectToday,
                                                 onSelectWeek,
                                                 onSelectRange,
                                                 onChangeDraftFrom,
                                                 onChangeDraftTo,
                                                 onApplyRange,
                                             }: Props) {
    return (
        <section className="trainings-panel trainings-panel-filter">
            <div className="trainings-panel-header">
                <div>
                    <div className="trainings-panel-kicker">Фокус</div>
                    <h2 className="trainings-panel-title">Что показывать на экране</h2>
                </div>
            </div>

            <div className="training-view-switch">
                <button
                    type="button"
                    className={`dashboard-btn ${
                        viewMode === "today" ? "dashboard-btn-primary" : "dashboard-btn-secondary"
                    }`}
                    onClick={onSelectToday}
                >
                    Сегодня
                </button>

                <button
                    type="button"
                    className={`dashboard-btn ${
                        viewMode === "week" ? "dashboard-btn-primary" : "dashboard-btn-secondary"
                    }`}
                    onClick={onSelectWeek}
                >
                    7 дней
                </button>

                <button
                    type="button"
                    className={`dashboard-btn ${
                        viewMode === "range" ? "dashboard-btn-primary" : "dashboard-btn-secondary"
                    }`}
                    onClick={onSelectRange}
                >
                    Период
                </button>
            </div>

            {viewMode === "today" && (
                <p className="training-view-hint">
                    Показываются только тренировки на текущую дату.
                </p>
            )}

            {viewMode === "week" && (
                <p className="training-view-hint">
                    Показываются тренировки на сегодня и ближайшие 6 дней.
                </p>
            )}

            {viewMode === "range" && (
                <form className="trainings-filter-form" onSubmit={onApplyRange}>
                    <div className="form-row">
                        <label htmlFor="from-date">С даты</label>
                        <input
                            id="from-date"
                            type="date"
                            value={draftFrom}
                            onChange={(event) => onChangeDraftFrom(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="to-date">По дату</label>
                        <input
                            id="to-date"
                            type="date"
                            value={draftTo}
                            onChange={(event) => onChangeDraftTo(event.target.value)}
                            required
                        />
                    </div>

                    <div className="trainings-filter-actions">
                        <button
                            type="submit"
                            className="dashboard-btn dashboard-btn-secondary"
                            disabled={isLoading}
                        >
                            {isLoading ? "Загружаем..." : "Применить"}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}