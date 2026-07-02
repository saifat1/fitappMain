import { useState } from "react";
import DutyIcon from "./DutyIcon";
import { buildHourSlots } from "../lib/trainerCalendar";

type Props = {
    startHour: number;
    endHour: number;
    initialStartTime?: string;
    isSavingDuty: boolean;
    onAddTraining: (startTime?: string) => void;
    onAddDuty: (startHour: number, hours: number) => void;
    onClose: () => void;
};

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function AddEntrySheet({
    startHour,
    endHour,
    initialStartTime,
    isSavingDuty,
    onAddTraining,
    onAddDuty,
    onClose,
}: Props) {
    const [step, setStep] = useState<"choose" | "duty">("choose");

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
