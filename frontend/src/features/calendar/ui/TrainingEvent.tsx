import Avatar from "../../../shared/ui/Avatar";
import { getInitials, avatarColor } from "../lib/calendarWeek";
import { getClientDisplayName } from "../lib/trainerCalendar";
import type { TrainingResponse } from "../../training/model/training.types";

type Props = {
    training: TrainingResponse;
    showTime?: boolean;
    /** Narrows the card and aligns it to the right, leaving room to the left
     *  for a duty block label underneath (same hour as a duty slot). */
    compact?: boolean;
    onClick: (trainingId: number) => void;
};

function timeRange(training: TrainingResponse): string {
    const start = training.startTime?.slice(0, 5);
    const end = training.endTime?.slice(0, 5);
    if (start && end) return `${start}–${end}`;
    return start ?? "";
}

export default function TrainingEvent({ training, showTime = false, compact = false, onClick }: Props) {
    const cancelled = training.status === "CANCELLED";

    return (
        <button
            type="button"
            className={`fb-event ${cancelled ? "fb-event--cancelled" : ""} ${compact ? "fb-event--compact" : ""}`}
            onClick={() => onClick(training.id)}
        >
            <Avatar
                initials={getInitials(training.clientFirstName, training.clientLastName)}
                color={avatarColor(training.clientId)}
                size="sm"
            />
            <span className="fb-event__body">
                <span className="fb-event__name">{getClientDisplayName(training)}</span>
                {showTime ? <span className="fb-event__time">{timeRange(training)}</span> : null}
            </span>
        </button>
    );
}
