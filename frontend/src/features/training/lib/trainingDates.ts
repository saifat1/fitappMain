import { formatDateKey, parseDateKey } from "../../calendar/lib/trainerCalendar";
import { formatDayMonth, relativeDayLabel } from "../../calendar/lib/calendarWeek";

const WEEKDAY_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const MONTHS_NOMINATIVE = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export function todayKey(): string {
    return formatDateKey(new Date());
}

export function addDaysKey(dateKey: string, days: number): string {
    const date = parseDateKey(dateKey);
    date.setDate(date.getDate() + days);
    return formatDateKey(date);
}

function capitalize(value: string): string {
    return value ? value[0].toUpperCase() + value.slice(1) : value;
}

/** "Сегодня" | "Завтра" | "Пт, 10 октября" */
export function formatTrainingDay(dateKey: string): string {
    const relative = relativeDayLabel(dateKey);
    if (relative) return capitalize(relative);
    const date = parseDateKey(dateKey);
    return `${WEEKDAY_SHORT[date.getDay()]}, ${formatDayMonth(dateKey)}`;
}

/** "Пт 10.10" — compact form for "было → стало" lines. */
export function formatShortDate(dateKey: string): string {
    const date = parseDateKey(dateKey);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return `${WEEKDAY_SHORT[date.getDay()]} ${dd}.${mm}`;
}

/** "Октябрь", or "Октябрь 2025" outside the current year. */
export function formatMonthGroup(dateKey: string): string {
    const date = parseDateKey(dateKey);
    const label = MONTHS_NOMINATIVE[date.getMonth()];
    return date.getFullYear() === new Date().getFullYear() ? label : `${label} ${date.getFullYear()}`;
}

export function shortTime(value: string | null): string {
    return value ? value.slice(0, 5) : "";
}

export function durationMinutes(start: string | null, end: string | null): number | null {
    if (!start || !end) return null;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm);
    return minutes > 0 ? minutes : null;
}

/** Groups items (already sorted) under consecutive month headers. */
export function groupByMonth<T>(items: T[], dateOf: (item: T) => string): { title: string; items: T[] }[] {
    const groups: { title: string; items: T[] }[] = [];
    for (const item of items) {
        const title = formatMonthGroup(dateOf(item));
        const last = groups[groups.length - 1];
        if (last && last.title === title) {
            last.items.push(item);
        } else {
            groups.push({ title, items: [item] });
        }
    }
    return groups;
}
