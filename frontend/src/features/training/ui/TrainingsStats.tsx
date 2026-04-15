import { useMemo } from "react";
import type { TrainingResponse } from "../model/training.types";

type Props = {
    trainings: TrainingResponse[];
};

export default function TrainingsStats({ trainings }: Props) {
    const stats = useMemo(() => {
        const planned = trainings.filter((item) => item.status === "PLANNED").length;
        const completed = trainings.filter((item) => item.status === "COMPLETED").length;
        const cancelled = trainings.filter((item) => item.status === "CANCELLED").length;

        return {
            total: trainings.length,
            planned,
            completed,
            cancelled,
        };
    }, [trainings]);

    return (
        <div className="trainings-hero-stats">
            <div className="trainings-stat-card">
                <span>Всего в диапазоне</span>
                <strong>{stats.total}</strong>
            </div>

            <div className="trainings-stat-card">
                <span>Запланировано</span>
                <strong>{stats.planned}</strong>
            </div>

            <div className="trainings-stat-card">
                <span>Завершено</span>
                <strong>{stats.completed}</strong>
            </div>

            <div className="trainings-stat-card">
                <span>Отменено</span>
                <strong>{stats.cancelled}</strong>
            </div>
        </div>
    );
}