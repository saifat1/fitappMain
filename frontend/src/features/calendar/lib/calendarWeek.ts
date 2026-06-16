import { formatDateKey, parseDateKey } from "./trainerCalendar";

export const WEEKDAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

const MONTHS_GENITIVE = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
];

const MONTHS_NOMINATIVE = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
];

/** ISO weekday index: Mon = 0 ... Sun = 6. */
function isoWeekdayIndex(date: Date): number {
    return (date.getDay() + 6) % 7;
}

/** Monday-based week (7 days) containing the given date. */
export function getWeekDays(date: Date): Date[] {
    const monday = new Date(date);
    monday.setDate(date.getDate() - isoWeekdayIndex(date));

    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        return day;
    });
}

/**
 * Monday-based month matrix. Cells outside the current month are `null`
 * so the grid renders clean (no greyed neighbour days), matching the mockup.
 */
export function getMonthMatrix(month: Date): (Date | null)[][] {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const leading = isoWeekdayIndex(firstDay);
    const cells: (Date | null)[] = Array.from({ length: leading }, () => null);

    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push(new Date(year, monthIndex, day));
    }

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
}

export function monthLabel(month: Date): string {
    return MONTHS_NOMINATIVE[month.getMonth()];
}

export function isSameDay(a: Date, b: Date): boolean {
    return formatDateKey(a) === formatDateKey(b);
}

export function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

/** "8 мая" */
export function formatDayMonth(dateKey: string): string {
    const date = parseDateKey(dateKey);
    return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

/** "сегодня" | "завтра" | "вчера" | "" — used for the timeline subtitle. */
export function relativeDayLabel(dateKey: string): string {
    const target = parseDateKey(dateKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
        (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "сегодня";
    if (diffDays === 1) return "завтра";
    if (diffDays === -1) return "вчера";
    return "";
}

/** "8 мая, завтра" or just "9 мая". */
export function formatDaySubtitle(dateKey: string): string {
    const base = formatDayMonth(dateKey);
    const relative = relativeDayLabel(dateKey);
    return relative ? `${base}, ${relative}` : base;
}

export function getInitials(firstName?: string | null, lastName?: string | null, fallback = "?"): string {
    const first = firstName?.trim()?.[0] ?? "";
    const last = lastName?.trim()?.[0] ?? "";
    const initials = `${first}${last}`.toUpperCase();
    return initials || fallback;
}

/** Stable pastel-ish avatar color derived from an id, matching the mockup palette. */
const AVATAR_COLORS = ["#2f80ed", "#9b51e0", "#eb5757", "#27ae60", "#f2994a", "#2d9cdb"];

export function avatarColor(seed: number): string {
    return AVATAR_COLORS[Math.abs(seed) % AVATAR_COLORS.length];
}
