import { formatDateKey } from "../../calendar/lib/trainerCalendar";
import type { NotificationKind } from "../model/notification.types";

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

/** "Сегодня" | "Вчера" | "3 июля" — matches the Figma notification list copy. */
export function formatNotificationTimeLabel(createdAtIso: string): string {
    const createdAt = new Date(createdAtIso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const createdKey = formatDateKey(createdAt);
    const todayKey = formatDateKey(today);
    const yesterdayKey = formatDateKey(yesterday);

    if (createdKey === todayKey) return "Сегодня";
    if (createdKey === yesterdayKey) return "Вчера";

    return `${createdAt.getDate()} ${MONTHS_GENITIVE[createdAt.getMonth()]}`;
}

export const NOTIFICATION_KIND_STYLE: Record<NotificationKind, { bg: string; fg: string }> = {
    NEW_CLIENT: { bg: "#d5e5ff", fg: "#2f6fed" },
    REQUEST: { bg: "#d3f0de", fg: "#1da858" },
    CANCELLATION: { bg: "#fad4d4", fg: "#e0392b" },
};
