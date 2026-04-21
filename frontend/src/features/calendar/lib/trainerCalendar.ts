import type {
    TrainerAvailabilityException,
    TrainerAvailabilityRule,
} from "../../availability/model/availability.types";
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

export type TrainerAgendaRowSource = "RULE" | "EXCEPTION" | "TRAINING_ONLY";

export type TrainerAgendaRowState = "FREE" | "BUSY";

export type TrainerAgendaRow = {
    key: string;
    startTime: string;
    endTime?: string;
    state: TrainerAgendaRowState;
    source: TrainerAgendaRowSource;
    comment?: string | null;
    training?: TrainingResponse;
};

function normalizeTime(value?: string | null): string {
    return value ? value.slice(0, 5) : "";
}

function timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return `${pad(hours)}:${pad(minutes)}`;
}

function getDayOfWeek(dateKey: string): number {
    const date = parseDateKey(dateKey);
    const jsDay = date.getDay();
    return jsDay === 0 ? 7 : jsDay;
}

function isValidTimeRange(startTime?: string | null, endTime?: string | null): boolean {
    const start = normalizeTime(startTime);
    const end = normalizeTime(endTime);

    return Boolean(start) && Boolean(end) && start < end;
}

function buildRuleRowsForDate(
    dateKey: string,
    rules: TrainerAvailabilityRule[]
): TrainerAgendaRow[] {
    const dayOfWeek = getDayOfWeek(dateKey);

    const result: TrainerAgendaRow[] = [];

    for (const rule of rules) {
        if (!rule.active || rule.dayOfWeek !== dayOfWeek) {
            continue;
        }

        if (!isValidTimeRange(rule.startTime, rule.endTime)) {
            continue;
        }

        const start = normalizeTime(rule.startTime);
        const end = normalizeTime(rule.endTime);
        const duration = Math.max(15, Number(rule.slotDurationMinutes) || 60);

        let cursor = timeToMinutes(start);
        const endMinutes = timeToMinutes(end);

        while (cursor + duration <= endMinutes) {
            const slotStart = minutesToTime(cursor);
            const slotEnd = minutesToTime(cursor + duration);

            result.push({
                key: `${dateKey}-${slotStart}-rule`,
                startTime: slotStart,
                endTime: slotEnd,
                state: "FREE",
                source: "RULE",
            });

            cursor += duration;
        }
    }

    return result;
}

function buildExceptionRowsForDate(
    dateKey: string,
    exceptions: TrainerAvailabilityException[]
): TrainerAgendaRow[] {
    return exceptions
        .filter((item) => item.date === dateKey)
        .filter((item) => isValidTimeRange(item.startTime, item.endTime))
        .map((item, index) => ({
            key: `${dateKey}-${normalizeTime(item.startTime)}-exception-${item.id ?? index}`,
            startTime: normalizeTime(item.startTime),
            endTime: normalizeTime(item.endTime),
            state: "FREE" as const,
            source: "EXCEPTION" as const,
            comment: item.comment ?? null,
        }));
}

function upsertAvailabilityRow(
    rows: TrainerAgendaRow[],
    nextRow: TrainerAgendaRow
): TrainerAgendaRow[] {
    const existingIndex = rows.findIndex(
        (row) => row.startTime === nextRow.startTime && !row.training
    );

    if (existingIndex === -1) {
        rows.push(nextRow);
        return rows;
    }

    const existing = rows[existingIndex];

    if (nextRow.source === "EXCEPTION") {
        rows[existingIndex] = nextRow;
        return rows;
    }

    if (existing.source !== "EXCEPTION") {
        rows[existingIndex] = nextRow;
    }

    return rows;
}

export function getAvailabilityDatesForMonth(
    month: Date,
    rules: TrainerAvailabilityRule[],
    exceptions: TrainerAvailabilityException[]
): {
    daysWithAvailability: Date[];
    daysWithExceptions: Date[];
} {
    const start = getMonthStart(month);
    const end = getMonthEnd(month);

    const daysWithAvailability: Date[] = [];
    const daysWithExceptions: Date[] = [];

    const exceptionDateSet = new Set(exceptions.map((item) => item.date));

    for (
        const cursor = new Date(start);
        cursor <= end;
        cursor.setDate(cursor.getDate() + 1)
    ) {
        const dateCopy = new Date(cursor);
        const dateKey = formatDateKey(dateCopy);
        const dayOfWeek = getDayOfWeek(dateKey);

        const hasRule = rules.some(
            (rule) =>
                rule.active &&
                rule.dayOfWeek === dayOfWeek &&
                isValidTimeRange(rule.startTime, rule.endTime)
        );

        const hasException = exceptionDateSet.has(dateKey);

        if (hasRule || hasException) {
            daysWithAvailability.push(dateCopy);
        }

        if (hasException) {
            daysWithExceptions.push(new Date(dateCopy));
        }
    }

    return {
        daysWithAvailability,
        daysWithExceptions,
    };
}

export function buildDayAgendaRows(
    dateKey: string,
    trainings: TrainingResponse[],
    rules: TrainerAvailabilityRule[],
    exceptions: TrainerAvailabilityException[]
): TrainerAgendaRow[] {
    const rows: TrainerAgendaRow[] = [];

    for (const row of buildRuleRowsForDate(dateKey, rules)) {
        upsertAvailabilityRow(rows, row);
    }

    for (const row of buildExceptionRowsForDate(dateKey, exceptions)) {
        upsertAvailabilityRow(rows, row);
    }

    const dayTrainings = trainings.filter((item) => item.trainingDate === dateKey);

    for (const training of dayTrainings) {
        const startTime = normalizeTime(training.startTime);
        const endTime = normalizeTime(training.endTime);

        const busyRow: TrainerAgendaRow = {
            key: `${dateKey}-${startTime || "notime"}-training-${training.id}`,
            startTime: startTime || "Без времени",
            endTime: endTime || undefined,
            state: "BUSY",
            source: "TRAINING_ONLY",
            training,
        };

        const existingFreeIndex = rows.findIndex(
            (row) => row.startTime === startTime && row.state === "FREE"
        );

        if (existingFreeIndex >= 0) {
            const existing = rows[existingFreeIndex];
            rows[existingFreeIndex] = {
                ...busyRow,
                endTime: endTime || existing.endTime,
                source: existing.source,
                comment: existing.comment,
            };
            continue;
        }

        rows.push(busyRow);
    }

    return rows.sort((a, b) => {
        const aNoTime = a.startTime === "Без времени";
        const bNoTime = b.startTime === "Без времени";

        if (aNoTime && bNoTime) {
            return 0;
        }

        if (aNoTime) {
            return 1;
        }

        if (bNoTime) {
            return -1;
        }

        const diff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
        if (diff !== 0) {
            return diff;
        }

        if (a.training && b.training) {
            return a.training.id - b.training.id;
        }

        return 0;
    });
}