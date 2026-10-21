import { useState } from "react";
import DutyIcon from "./DutyIcon";
import { buildHourSlots } from "../lib/trainerCalendar";
import { addDays, WHOLE_DAY_END, WHOLE_DAY_START } from "../../availability/lib/closedTime";
import type { TrainerAvailabilityException } from "../../availability/model/availability.types";

type Props = {
    startHour: number;
    endHour: number;
    /** Day the sheet was opened for (yyyy-MM-dd). */
    selectedDate: string;
    initialStartTime?: string;
    isSavingDuty: boolean;
    isSavingClosed: boolean;
    onAddTraining: (startTime?: string) => void;
    onAddDuty: (startHour: number, hours: number) => void;
    onCloseTime: (payload: TrainerAvailabilityException) => void;
    onClose: () => void;
};

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6];

/** One-tap extensions of a closure ("выходные на большой период"). */
const EXTEND_OPTIONS = [
    { label: "+1 неделя", days: 6 },
    { label: "+2 недели", days: 13 },
    { label: "+1 месяц", days: 29 },
];

export default function AddEntrySheet({
    startHour,
    endHour,
    selectedDate,
    initialStartTime,
    isSavingDuty,
    isSavingClosed,
    onAddTraining,
    onAddDuty,
    onCloseTime,
    onClose,
}: Props) {
    const [step, setStep] = useState<"choose" | "duty" | "closed">("choose");

    const [wholeDay, setWholeDay] = useState(!initialStartTime);
    const [closedFrom, setClosedFrom] = useState(initialStartTime ?? "12:00");
    const [closedTo, setClosedTo] = useState(() => {
        const hour = Number((initialStartTime ?? "12:00").slice(0, 2));
        return `${String(Math.min(hour + 1, 23)).padStart(2, "0")}:00`;
    });
    const [closedUntil, setClosedUntil] = useState(selectedDate);
    const [closedComment, setClosedComment] = useState("");
    const [closedError, setClosedError] = useState("");

    const submitClosed = () => {
        if (!wholeDay && (!closedFrom || !closedTo || closedTo <= closedFrom)) {
            setClosedError("Конец должен быть позже начала");
            return;
        }
        if (closedUntil < selectedDate) {
            setClosedError("Дата «до» не может быть раньше выбранного дня");
            return;
        }
        setClosedError("");
        onCloseTime({
            date: selectedDate,
            endDate: closedUntil > selectedDate ? closedUntil : null,
            startTime: wholeDay ? WHOLE_DAY_START : `${closedFrom}:00`,
            endTime: wholeDay ? WHOLE_DAY_END : `${closedTo}:00`,
            comment: closedComment.trim() || undefined,
        });
    };

    const hourOptions = buildHourSlots(startHour, endHour - 1);
    const defaultStart = initialStartTime && /^\d{2}:00$/.test(initialStartTime)
        ? Number(initialStartTime.slice(0, 2))
        : startHour;

    const [dutyStart, setDutyStart] = useState(defaultStart);
    const maxHours = Math.max(1, endHour - dutyStart);
    const [dutyHours, setDutyHours] = useState(1);

    return (
        <>
            <button type="button" className="fb-overlay" aria-label="Закрыть" onClick={onClose} />

            <div className="fb-add-sheet" role="dialog" aria-label="Добавить запись">
                <div className="fb-add-sheet__handle" />

                {step === "choose" ? (
                    <>
                        <h3 className="fb-add-sheet__title">Что добавить?</h3>

                        <button
                            type="button"
                            className="fb-add-sheet__option"
                            onClick={() => onAddTraining(initialStartTime)}
                        >
                            <span className="fb-add-sheet__optionIcon fb-add-sheet__optionIcon--training">+</span>
                            <span className="fb-add-sheet__optionBody">
                                <span className="fb-add-sheet__optionTitle">Тренировка</span>
                                <span className="fb-add-sheet__optionHint">Запись клиента на выбранное время</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="fb-add-sheet__option"
                            onClick={() => setStep("duty")}
                        >
                            <span className="fb-add-sheet__optionIcon fb-add-sheet__optionIcon--duty"><DutyIcon /></span>
                            <span className="fb-add-sheet__optionBody">
                                <span className="fb-add-sheet__optionTitle">Дежурство</span>
                                <span className="fb-add-sheet__optionHint">Отметить часы дежурства для отчёта</span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="fb-add-sheet__option"
                            onClick={() => setStep("closed")}
                        >
                            <span className="fb-add-sheet__optionIcon fb-add-sheet__optionIcon--closed">×</span>
                            <span className="fb-add-sheet__optionBody">
                                <span className="fb-add-sheet__optionTitle">Закрыть время</span>
                                <span className="fb-add-sheet__optionHint">Выходной или часы, когда клиенты не могут записаться</span>
                            </span>
                        </button>
                    </>
                ) : step === "closed" ? (
                    <>
                        <h3 className="fb-add-sheet__title">Закрыть время</h3>

                        <label className="fb-add-sheet__row fb-add-sheet__row--toggle">
                            <span className="fb-add-sheet__label">Весь день (выходной)</span>
                            <input
                                type="checkbox"
                                className="fb-switch"
                                checked={wholeDay}
                                onChange={(event) => setWholeDay(event.target.checked)}
                            />
                        </label>

                        {!wholeDay && (
                            <div className="fb-add-sheet__row">
                                <span className="fb-add-sheet__label">Время</span>
                                <span className="fb-add-sheet__times">
                                    <input
                                        type="time"
                                        step={900}
                                        className="fb-add-sheet__select"
                                        aria-label="Закрыть с"
                                        value={closedFrom}
                                        onChange={(event) => setClosedFrom(event.target.value)}
                                    />
                                    —
                                    <input
                                        type="time"
                                        step={900}
                                        className="fb-add-sheet__select"
                                        aria-label="Закрыть до"
                                        value={closedTo}
                                        onChange={(event) => setClosedTo(event.target.value)}
                                    />
                                </span>
                            </div>
                        )}

                        <div className="fb-add-sheet__row">
                            <label className="fb-add-sheet__label" htmlFor="closed-until">
                                Повторять каждый день до
                            </label>
                            <input
                                id="closed-until"
                                type="date"
                                className="fb-add-sheet__select"
                                min={selectedDate}
                                value={closedUntil}
                                onChange={(event) => setClosedUntil(event.target.value || selectedDate)}
                            />
                        </div>

                        <div className="fb-chips fb-chips--wrap fb-add-sheet__chips">
                            {EXTEND_OPTIONS.map((option) => (
                                <button
                                    key={option.label}
                                    type="button"
                                    className="fb-chip"
                                    onClick={() => setClosedUntil(addDays(selectedDate, option.days))}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        <input
                            className="fb-add-sheet__select fb-add-sheet__comment"
                            placeholder="Комментарий: отпуск, больничный…"
                            value={closedComment}
                            onChange={(event) => setClosedComment(event.target.value)}
                        />

                        {closedError ? <div className="fb-cal-error">{closedError}</div> : null}

                        <div className="fb-add-sheet__actions">
                            <button
                                type="button"
                                className="fb-btn fb-btn--ghost"
                                onClick={() => setStep("choose")}
                                disabled={isSavingClosed}
                            >
                                Назад
                            </button>
                            <button
                                type="button"
                                className="fb-btn fb-btn--primary"
                                onClick={submitClosed}
                                disabled={isSavingClosed}
                            >
                                {isSavingClosed ? "Сохранение…" : "Закрыть"}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="fb-add-sheet__title">Дежурство</h3>

                        <div className="fb-add-sheet__row">
                            <label className="fb-add-sheet__label" htmlFor="duty-start">
                                Начало
                            </label>
                            <select
                                id="duty-start"
                                className="fb-add-sheet__select"
                                value={dutyStart}
                                onChange={(event) => {
                                    const next = Number(event.target.value);
                                    setDutyStart(next);
                                    setDutyHours((prev) => Math.min(prev, Math.max(1, endHour - next)));
                                }}
                            >
                                {hourOptions.map((label) => (
                                    <option key={label} value={Number(label.slice(0, 2))}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="fb-add-sheet__row">
                            <label className="fb-add-sheet__label" htmlFor="duty-hours">
                                Продолжительность
                            </label>
                            <select
                                id="duty-hours"
                                className="fb-add-sheet__select"
                                value={dutyHours}
                                onChange={(event) => setDutyHours(Number(event.target.value))}
                            >
                                {DURATION_OPTIONS.filter((hours) => hours <= maxHours).map((hours) => (
                                    <option key={hours} value={hours}>
                                        {hours} {hours === 1 ? "час" : hours < 5 ? "часа" : "часов"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="fb-add-sheet__preview">
                            {String(dutyStart).padStart(2, "0")}:00–
                            {String(dutyStart + dutyHours).padStart(2, "0")}:00
                        </div>

                        <div className="fb-add-sheet__actions">
                            <button
                                type="button"
                                className="fb-btn fb-btn--ghost"
                                onClick={() => setStep("choose")}
                                disabled={isSavingDuty}
                            >
                                Назад
                            </button>
                            <button
                                type="button"
                                className="fb-btn fb-btn--primary"
                                onClick={() => onAddDuty(dutyStart, dutyHours)}
                                disabled={isSavingDuty}
                            >
                                {isSavingDuty ? "Сохранение…" : "Добавить дежурство"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
