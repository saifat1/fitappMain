import type { TrainerAvailabilityException } from "../model/availability.types";

/** A "whole day" closure is stored as 00:00–23:59 (the backend has no all-day flag). */
export const WHOLE_DAY_START = "00:00:00";
export const WHOLE_DAY_END = "23:59:00";

export function isWholeDay(item: Pick<TrainerAvailabilityException, "startTime" | "endTime">): boolean {
    return item.startTime.slice(0, 5) === "00:00" && item.endTime.slice(0, 5) === "23:59";
}

export function lastDate(item: TrainerAvailabilityException): string {
    return item.endDate && item.endDate > item.date ? item.endDate : item.date;
}

export function coversDate(item: TrainerAvailabilityException, dateKey: string): boolean {
    return item.date <= dateKey && dateKey <= lastDate(item);
}

function formatShortDate(dateKey: string): string {
    const [year, month, day] = dateKey.split("-");
    return `${day}.${month}.${year}`;
}

/** "Весь день" / "12:00–15:00", plus the period for multi-day closures. */
export function closedTimeLabel(item: TrainerAvailabilityException): string {
    const time = isWholeDay(item) ? "Весь день" : `${item.startTime.slice(0, 5)}–${item.endTime.slice(0, 5)}`;
    const last = lastDate(item);
    return last !== item.date ? `${time} · ${formatShortDate(item.date)} – ${formatShortDate(last)}` : time;
}

export function addDays(dateKey: string, days: number): string {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day + days);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
