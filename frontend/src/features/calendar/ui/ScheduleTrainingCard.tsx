import Avatar from "../../../shared/ui/Avatar";
import { getInitials, avatarColor } from "../lib/calendarWeek";
import { getClientDisplayName } from "../lib/trainerCalendar";
import type { TrainingResponse } from "../../training/model/training.types";

type Props = {
    training: TrainingResponse;
    onClick: () => void;
};

const STATUS_LABEL: Record<string, string> = {
    PLANNED: "создана",
    COMPLETED: "проведена",
    CANCELLED: "отменена",
};

export default function ScheduleTrainingCard({ training, onClick }: Props) {
    const isCompleted = training.status === "COMPLETED";

    return (
        <button
            type="button"
            className={`fb-schedule-card ${isCompleted ? "fb-schedule-card--completed" : ""}`}
            onClick={onClick}
        >
            <Avatar
                initials={getInitials(training.clientFirstName, training.clientLastName)}
                color={avatarColor(training.clientId)}
                size="sm"
            />
            <span className="fb-schedule-card__name">{getClientDisplayName(training)}</span>
            <span className={`fb-schedule-card__badge fb-schedule-card__badge--${training.status.toLowerCase()}`}>
                {STATUS_LABEL[training.status] ?? training.status}
            </span>
        </button>
    );
}
