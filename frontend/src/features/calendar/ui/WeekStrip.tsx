import {
    WEEKDAY_LABELS,
    getWeekDays,
    getMonthMatrix,
    monthLabel,
    isToday,
} from "../lib/calendarWeek";
import { formatDateKey, parseDateKey } from "../lib/trainerCalendar";

type Props = {
    selectedDate: string;          // yyyy-mm-dd
    currentMonth: Date;            // first day of visible month
    datesWithTrainings: Set<string>;
    expanded: boolean;
    onToggleExpanded: () => void;
    onSelectDate: (dateKey: string) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
};

function DayCell({
    date,
    selectedDate,
    hasDot,
    onSelect,
}: {
    date: Date | null;
    selectedDate: string;
    hasDot: boolean;
    onSelect: (dateKey: string) => void;
}) {
    if (!date) {
        return <span className="fb-day fb-day--empty" aria-hidden="true" />;
    }

    const key = formatDateKey(date);
    const selected = key === selectedDate;

    const className = [
        "fb-day",
        selected ? "fb-day--selected" : "",
        isToday(date) && !selected ? "fb-day--today" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button type="button" className={className} onClick={() => onSelect(key)}>
            <span className="fb-day__num">{date.getDate()}</span>
            {hasDot ? <span className="fb-day__dot" /> : null}
        </button>
    );
}

export default function WeekStrip({
    selectedDate,
    currentMonth,
    datesWithTrainings,
    expanded,
    onToggleExpanded,
    onSelectDate,
    onPrevMonth,
    onNextMonth,
}: Props) {
    const selected = parseDateKey(selectedDate);
    const weekDays = getWeekDays(selected);
    const monthMatrix = getMonthMatrix(currentMonth);

    return (
        <div className="fb-weekstrip">
            <div className="fb-weekstrip__top">
                <button type="button" className="fb-weekstrip__month" onClick={onToggleExpanded}>
                    {monthLabel(currentMonth)}
                    <span className="fb-mode-switch__chevron">{expanded ? "▴" : "▾"}</span>
                </button>

                <div className="fb-weekstrip__nav">
                    <button
                        type="button"
                        className="fb-iconbtn"
                        onClick={onPrevMonth}
                        aria-label="Предыдущий месяц"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        className="fb-iconbtn"
                        onClick={onNextMonth}
                        aria-label="Следующий месяц"
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className="fb-week-grid">
                {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="fb-week-grid__wd">
                        {label}
                    </div>
                ))}
            </div>

            {expanded ? (
                <div className="fb-month-grid">
                    {monthMatrix.map((week, weekIndex) => (
                        <div key={weekIndex} className="fb-month-grid__week">
                            {week.map((date, dayIndex) => (
                                <DayCell
                                    key={dayIndex}
                                    date={date}
                                    selectedDate={selectedDate}
                                    hasDot={Boolean(date && datesWithTrainings.has(formatDateKey(date)))}
                                    onSelect={onSelectDate}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="fb-month-grid__week">
                    {weekDays.map((date) => (
                        <DayCell
                            key={formatDateKey(date)}
                            date={date}
                            selectedDate={selectedDate}
                            hasDot={datesWithTrainings.has(formatDateKey(date))}
                            onSelect={onSelectDate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
