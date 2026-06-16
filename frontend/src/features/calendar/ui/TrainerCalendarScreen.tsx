import { useMemo, useState } from "react";
import CalendarHeader, { type CalendarMode } from "./CalendarHeader";
import MobileShell from "../../../widgets/MobileShell";
import WeekStrip from "./WeekStrip";
import DayTimeline from "./DayTimeline";
import ScheduleList from "./ScheduleList";
import {
    getInitials,
    avatarColor,
    formatDaySubtitle,
} from "../lib/calendarWeek";
import type { TrainingResponse } from "../../training/model/training.types";
import type { CurrentUserResponse } from "../../auth/model/auth.types";

type Props = {
    currentUser: CurrentUserResponse;
    trainings: TrainingResponse[];
    selectedDate: string;
    currentMonth: Date;
    isLoading: boolean;
    errorMessage?: string;
    onSelectDate: (dateKey: string) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onOpenTraining: (trainingId: number) => void;
    onQuickAdd: (startTime?: string) => void;
    onOpenProfile?: () => void;
};

export default function TrainerCalendarScreen({
    currentUser,
    trainings,
    selectedDate,
    currentMonth,
    isLoading,
    errorMessage,
    onSelectDate,
    onPrevMonth,
    onNextMonth,
    onOpenTraining,
    onQuickAdd,
    onOpenProfile,
}: Props) {
    const [mode, setMode] = useState<CalendarMode>("planning");
    const [expanded, setExpanded] = useState(false);

    const datesWithTrainings = useMemo(
        () => new Set(trainings.map((item) => item.trainingDate)),
        [trainings]
    );

    const dayTrainings = useMemo(
        () => trainings.filter((item) => item.trainingDate === selectedDate),
        [trainings, selectedDate]
    );

    const avatarInitials = getInitials(
        currentUser.firstName,
        currentUser.lastName,
        currentUser.email?.[0]?.toUpperCase() ?? "U"
    );

    const header = (
        <CalendarHeader
            mode={mode}
            onModeChange={setMode}
            avatarInitials={avatarInitials}
            avatarColor={avatarColor(currentUser.id)}
            onAvatarClick={onOpenProfile}
        />
    );

    const fab = (
        <button
            type="button"
            className="fb-fab"
            aria-label="Добавить тренировку"
            onClick={() => onQuickAdd()}
        >
            +
        </button>
    );

    return (
        <MobileShell header={header} fab={fab}>
            <WeekStrip
                    selectedDate={selectedDate}
                    currentMonth={currentMonth}
                    datesWithTrainings={datesWithTrainings}
                    expanded={expanded}
                    onToggleExpanded={() => setExpanded((prev) => !prev)}
                    onSelectDate={onSelectDate}
                    onPrevMonth={onPrevMonth}
                    onNextMonth={onNextMonth}
                />

                <div className="fb-divider" />

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                {mode === "planning" ? (
                    <>
                        <div className="fb-day-subtitle">{formatDaySubtitle(selectedDate)}</div>
                        {isLoading ? (
                            <div className="fb-cal-status">Загрузка…</div>
                        ) : (
                            <DayTimeline
                                dayTrainings={dayTrainings}
                                onOpenTraining={onOpenTraining}
                                onQuickAdd={onQuickAdd}
                            />
                        )}
                    </>
                ) : isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : (
                    <ScheduleList trainings={trainings} onOpenTraining={onOpenTraining} />
                )}
        </MobileShell>
    );
}
