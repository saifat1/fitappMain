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
import PendingReschedulesBanner from "../../reschedule/ui/PendingReschedulesBanner";
import type { TrainerDutySlotResponse } from "../../duty-slot/model/dutySlot.types";
import type { TrainerAvailabilityException } from "../../availability/model/availability.types";
import { closedTimeLabel, coversDate } from "../../availability/lib/closedTime";

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
    onCompleteTraining: (trainingId: number) => void;
    onCancelTraining: (trainingId: number) => void;
    onHideTraining: (trainingId: number) => void;
    /** All closed intervals of the trainer (filtered to the selected day here). */
    closedTimes: TrainerAvailabilityException[];
    isSavingClosed: boolean;
    reopeningClosedId: number | null;
    onCloseTime: (payload: TrainerAvailabilityException) => Promise<boolean>;
    onReopenTime: (item: TrainerAvailabilityException) => void;
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
    onCompleteTraining,
    onCancelTraining,
    onHideTraining,
    closedTimes,
    isSavingClosed,
    reopeningClosedId,
    onCloseTime,
    onReopenTime,
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

    const dayClosedTimes = useMemo(
        () => closedTimes.filter((item) => coversDate(item, selectedDate)),
        [closedTimes, selectedDate]
    );

    const closedList = dayClosedTimes.length > 0 ? (
        <div className="fb-closed-list">
            {dayClosedTimes.map((item) => (
                <div key={item.id ?? `${item.date}-${item.startTime}`} className="fb-closed-item">
                    <span className="fb-closed-item__main">
                        <span className="fb-closed-item__title">Закрыто для записи · {closedTimeLabel(item)}</span>
                        {item.comment ? <span className="fb-closed-item__sub">{item.comment}</span> : null}
                    </span>
                    {item.id != null && (
                        <button
                            type="button"
                            className="fb-closed-item__action"
                            onClick={() => onReopenTime(item)}
                            disabled={reopeningClosedId === item.id}
                        >
                            Открыть
                        </button>
                    )}
                </div>
            ))}
        </div>
    ) : null;

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

            <PendingReschedulesBanner />

            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            {mode === "planning" ? (
                <>
                    <div className="fb-day-subtitle">{formatDaySubtitle(selectedDate)}</div>
                    {closedList}
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
                <>
                {closedList}
                <ScheduleList
                    selectedDate={selectedDate}
                    trainings={dayTrainings}
                    dutySlots={dayDutySlots}
                    processingDutyKey={processingDutyKey}
                    onOpenTraining={onOpenTraining}
                    onDeleteDutyBlock={onDeleteDutyBlock}
                    onCompleteTraining={onCompleteTraining}
                    onCancelTraining={onCancelTraining}
                    onHideTraining={onHideTraining}
                />
                </>
            )}

            {addSheet ? (
                <AddEntrySheet
                    startHour={TIMELINE_START_HOUR}
                    endHour={TIMELINE_END_HOUR}
                    selectedDate={selectedDate}
                    initialStartTime={addSheet.startTime}
                    isSavingDuty={isSavingDuty}
                    isSavingClosed={isSavingClosed}
                    onCloseTime={async (payload) => {
                        const success = await onCloseTime(payload);
                        if (success) {
                            closeSheet();
                        }
                    }}
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
