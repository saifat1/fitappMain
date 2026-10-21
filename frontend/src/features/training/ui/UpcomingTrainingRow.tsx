import CalendarIcon from "./CalendarIcon";
import HouseIcon from "./HouseIcon";
import { durationMinutes, formatTrainingDay } from "../lib/trainingDates";
import { MUSCLE_GROUP_OPTIONS, trainingTitle } from "../model/training.types";
import type { TrainingResponse } from "../model/training.types";

type Props = {
    training: TrainingResponse;
    onClick: () => void;
    /** Overrides the "Персональная / Самостоятельная" title (e.g. client name in the trainer's list). */
    title?: string;
    /** Hide the status badge where every row is planned anyway. */
    showStatus?: boolean;
};

const STATUS_LABEL: Record<string, string> = {
    PLANNED: "Запланирована",
    COMPLETED: "Завершена",
    CANCELLED: "Отменена",
};

const STATUS_CLASS: Record<string, string> = {
    PLANNED: "fb-status-badge--planned",
    COMPLETED: "fb-status-badge--completed",
    CANCELLED: "fb-status-badge--cancelled",
};

function muscleGroupsLabel(codes: string[]): string {
    if (codes.length === 0) return "Группы мышц не указаны";
    return codes
        .map((code) => MUSCLE_GROUP_OPTIONS.find((o) => o.code === code)?.label ?? code)
        .join(" + ");
}

export default function UpcomingTrainingRow({ training, onClick, title, showStatus = true }: Props) {
    const isPersonal = training.trainingType !== "INDEPENDENT";
    const duration = durationMinutes(training.startTime, training.endTime);

    return (
        <button type="button" className="fb-row fb-row--button" onClick={onClick}>
            <span className={`fb-training-row__icon ${isPersonal ? "fb-training-row__icon--personal" : "fb-training-row__icon--independent"}`}>
                {isPersonal ? <CalendarIcon /> : <HouseIcon />}
            </span>

            <span className="fb-row__main">
                <span className="fb-row__title">{title ?? trainingTitle(training)}</span>
                <span className="fb-row__sub">
                    {formatTrainingDay(training.trainingDate)}
                    {isPersonal
                        ? training.startTime
                            ? `, ${training.startTime.slice(0, 5)}${duration ? ` · ${duration} мин` : ""}`
                            : ""
                        : `, ${muscleGroupsLabel(training.focusMuscleGroups)}`}
                </span>
            </span>

            {showStatus && (
                <span className={`fb-status-badge ${STATUS_CLASS[training.status] ?? ""}`}>
                    {STATUS_LABEL[training.status] ?? training.status}
                </span>
            )}

            <span className="fb-row__chevron">›</span>
        </button>
    );
}
