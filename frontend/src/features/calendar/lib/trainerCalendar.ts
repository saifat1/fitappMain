import type { TrainingResponse } from "../../training/model/training.types";

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

export function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function formatMonthTitle(date: Date): string {
    return date.toLocaleDateString("ru-RU", {
        month: "long",
        year: "numeric",
    });
}

export function getMonthStart(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthEnd(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getMonthRange(date: Date): { from: string; to: string } {
    return {
        from: formatDateKey(getMonthStart(date)),
        to: formatDateKey(getMonthEnd(date)),
    };
}

export function shiftMonth(date: Date, offset: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export function getDefaultSelectedDate(month: Date): string {
    const today = new Date();

    if (
        today.getFullYear() === month.getFullYear() &&
        today.getMonth() === month.getMonth()
    ) {
        return formatDateKey(today);
    }

    return formatDateKey(getMonthStart(month));
}

export function groupTrainingsByDate(
    trainings: TrainingResponse[]
): Record<string, TrainingResponse[]> {
    return trainings.reduce<Record<string, TrainingResponse[]>>((acc, training) => {
        const key = training.trainingDate;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(training);
        return acc;
    }, {});
}

export function buildHourSlots(startHour = 8, endHour = 21): string[] {
    const slots: string[] = [];

    for (let hour = startHour; hour <= endHour; hour += 1) {
        slots.push(`${pad(hour)}:00`);
    }

    return slots;
}

export function getClientDisplayName(training: TrainingResponse): string {
    const fullName = [training.clientFirstName, training.clientLastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || training.clientEmail || `Клиент #${training.clientId}`;
}