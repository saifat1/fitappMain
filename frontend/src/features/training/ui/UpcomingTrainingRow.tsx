import CalendarIcon from "./CalendarIcon";
import HouseIcon from "./HouseIcon";
import { formatDaySubtitle } from "../../calendar/lib/calendarWeek";
import { MUSCLE_GROUP_OPTIONS } from "../model/training.types";
import type { TrainingResponse } from "../model/training.types";

type Props = {
    training: TrainingResponse;
    onClick: () => void;
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

function durationMinutes(start: string | null, end: string | null): number | null {
    if (!start || !end) return null;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    return minutes > 0 ? minutes : null;
}

function muscleGroupsLabel(codes: string[]): string {
    if (codes.length === 0) return "Группы мышц не указаны";
    return codes
        .map((code) => MUSCLE_GROUP_OPTIONS.find((o) => o.code === code)?.label ?? code)
        .join(" + ");
}

export default function UpcomingTrainingRow({ training, onClick }: Props) {
    const isPersonal = training.trainingType !== "INDEPENDENT";
    const duration = durationMinutes(training.startTime, training.endTime);

    return (
        <button type="button" className="fb-row fb-row--button" onClick={onClick}>
            <span className={`fb-training-row__icon ${isPersonal ? "fb-training-row__icon--personal" : "fb-training-row__icon--independent"}`}>
                {isPersonal ? <CalendarIcon /> : <HouseIcon />}
            </span>

            <span className="fb-row__main">
                <span className="fb-row__title">{isPersonal ? "Персональная" : "Самостоятельная"}</span>
                <span className="fb-row__sub">
                    {formatDaySubtitle(training.trainingDate)}
                    {isPersonal
                        ? training.startTime
                            ? `, ${training.startTime.slice(0, 5)}${duration ? ` · ${duration} мин` : ""}`
                            : ""
                        : `, ${muscleGroupsLabel(training.focusMuscleGroups)}`}
                </span>
            </span>

            <span className={`fb-status-badge ${STATUS_CLASS[training.status] ?? ""}`}>
                {STATUS_LABEL[training.status] ?? training.status}
            </span>

            <span className="fb-row__chevron">›</span>
        </button>
    );
}
