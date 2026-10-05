import type { BookingRequestResponse } from "../../booking/model/booking.types";
import { formatShortDate, shortTime } from "../../training/lib/trainingDates";

/**
 * A reschedule is a booking request that points at the training it moves
 * (originalTrainingId). The old training stays planned until the trainer
 * approves; then the backend cancels it and creates the new one.
 */
export function isReschedule(request: BookingRequestResponse): boolean {
    return request.originalTrainingId != null;
}

export const RESCHEDULE_STATUS_PILL: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "Ожидает", cls: "fb-pill--invite" },
    APPROVED: { label: "Перенесена", cls: "fb-pill--ok" },
    DECLINED: { label: "Отклонена", cls: "fb-pill--danger" },
    CANCELLED: { label: "Отозвана", cls: "fb-pill--muted" },
};

export function requestedDateKey(request: BookingRequestResponse): string {
    return request.requestedStart.slice(0, 10);
}

export function requestedStartTime(request: BookingRequestResponse): string {
    return request.requestedStart.slice(11, 16);
}

export function requestedEndTime(request: BookingRequestResponse): string {
    return request.requestedEnd.slice(11, 16);
}

/** "Чт 09.10, 18:00 → Пт 10.10, 19:00" (or just the new time when the original is unknown). */
export function rescheduleLine(request: BookingRequestResponse): string {
    const next = `${formatShortDate(requestedDateKey(request))}, ${requestedStartTime(request)}`;
    if (!request.originalTrainingDate) return next;
    const prev = `${formatShortDate(request.originalTrainingDate)}${
        request.originalStartTime ? `, ${shortTime(request.originalStartTime)}` : ""
    }`;
    return `${prev} → ${next}`;
}

export function requestClientName(request: BookingRequestResponse): string {
    const full = [request.clientFirstName, request.clientLastName].filter(Boolean).join(" ").trim();
    return full || request.clientEmail || `Клиент #${request.clientId}`;
}
