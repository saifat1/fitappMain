import { useMemo, useState } from "react";
import CalendarHeader, { type CalendarMode } from "./CalendarHeader";
import MobileShell from "../../../widgets/MobileShell";
import WeekStrip from "./WeekStrip";
import DayTimeline from "./DayTimeline";
import ScheduleList from "./ScheduleList";
import AddEntrySheet from "./AddEntrySheet";
import {
    getInitials,
    avatarColor,
    formatDaySubtitle,
} from "../lib/calendarWeek";
import type { TrainingResponse } from "../../training/model/training.types";
import type { CurrentUserResponse } from "../../auth/model/auth.types";
import type { TrainerDutySlotResponse } from "../../duty-slot/model/dutySlot.types";

type Props = {
    currentUser: CurrentUserResponse;
    trainings: TrainingResponse[];
    dutySlots: TrainerDutySlotResponse[];
    selectedDate: string;
    currentMonth: Date;
    isLoading: boolean;
    errorMessage?: string;
    processingDutyKey: string | null;
    isSavingDuty: boolean;
    onSelectDate: (dateKey: string) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onOpenTraining: (trainingId: number) => void;
    onQuickAdd: (startTime?: string) => void;
    onCreateDutyRange: (startHour: number, hours: number) => Promise<boolean>;
    onDeleteDutyBlock: (slotIds: number[], label: string) => void;
    onOpenProfile?: () => void;
};

const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 21;

export default function TrainerCalendarScreen({
    currentUser,
    trainings,
    dutySlots,
    selectedDate,
    currentMonth,
    isLoading,
    errorMessage,
    processingDutyKey,
    isSavingDuty,
    onSelectDate,
    onPrevMonth,
    onNextMonth,
    onOpenTraining,
    onQuickAdd,
    onCreateDutyRange,
    onDeleteDutyBlock,
    onOpenProfile,
}: Props) {
    const [mode, setMode] = useState<CalendarMode>("planning");
    const [expanded, setExpanded] = useState(false);
    const [addSheet, setAddSheet] = useState<{ startTime?: string } | null>(null);

    const datesWithTrainings = useMemo(
        () => new Set(trainings.map((item) => item.trainingDate)),
        [trainings]
    );

    const dayTrainings = useMemo(
        () => trainings.filter((item) => item.trainingDate === selectedDate),
        [trainings, selectedDate]
    );

    const dayDutySlots = useMemo(
        () => dutySlots.filter((item) => item.dutyDate === selectedDate),
        [dutySlots, selectedDate]
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
            aria-label="Добавить запись"
            onClick={() => setAddSheet({})}
        >
            +
        </button>
    );

    const closeSheet = () => setAddSheet(null);

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
                            dayDutySlots={dayDutySlots}
                            onOpenTraining={onOpenTraining}
                            onQuickAdd={(startTime) => setAddSheet({ startTime })}
                            onDeleteDutyBlock={onDeleteDutyBlock}
                            processingDutyKey={processingDutyKey}
                            startHour={TIMELINE_START_HOUR}
                            endHour={TIMELINE_END_HOUR}
                        />
                    )}
                </>
            ) : isLoading ? (
                <div className="fb-cal-status">Загрузка…</div>
            ) : (
                <ScheduleList
                    trainings={dayTrainings}
                    dutySlots={dayDutySlots}
                    processingDutyKey={processingDutyKey}
                    onOpenTraining={onOpenTraining}
                    onDeleteDutyBlock={onDeleteDutyBlock}
                />
            )}

            {addSheet ? (
                <AddEntrySheet
                    startHour={TIMELINE_START_HOUR}
                    endHour={TIMELINE_END_HOUR}
                    initialStartTime={addSheet.startTime}
                    isSavingDuty={isSavingDuty}
                    onAddTraining={(startTime) => {
                        closeSheet();
                        onQuickAdd(startTime);
                    }}
                    onAddDuty={async (startHour, hours) => {
                        const success = await onCreateDutyRange(startHour, hours);
                        if (success) {
                            closeSheet();
                        }
                    }}
                    onClose={closeSheet}
                />
            ) : null}
        </MobileShell>
    );
}
