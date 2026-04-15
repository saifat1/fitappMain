import type { TrainingResponse } from "../model/training.types";

export type TrainingViewMode = "today" | "week" | "range";

export function formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function getTodayRange(): { from: string; to: string } {
    const today = formatDateForInput(new Date());
    return { from: today, to: today };
}

export function getWeekRange(): { from: string; to: string } {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 6);

    return {
        from: formatDateForInput(start),
        to: formatDateForInput(end),
    };
}

export function sortTrainingsByDateTime(items: TrainingResponse[]): TrainingResponse[] {
    return [...items].sort((left, right) => {
        const leftKey = `${left.trainingDate}T${left.startTime ?? "00:00"}`;
        const rightKey = `${right.trainingDate}T${right.startTime ?? "00:00"}`;
        return leftKey.localeCompare(rightKey);
    });
}

export function isDateWithinRange(date: string, from: string, to: string): boolean {
    return date >= from && date <= to;
}

export function partitionTrainingsByToday(
    items: TrainingResponse[],
    from: string,
    to: string
): {
    todayTrainings: TrainingResponse[];
    otherTrainings: TrainingResponse[];
    rangeIncludesToday: boolean;
} {
    const today = formatDateForInput(new Date());
    const rangeIncludesToday = isDateWithinRange(today, from, to);

    if (!rangeIncludesToday) {
        return {
            todayTrainings: [],
            otherTrainings: items,
            rangeIncludesToday,
        };
    }

    return {
        todayTrainings: items.filter((item) => item.trainingDate === today),
        otherTrainings: items.filter((item) => item.trainingDate !== today),
        rangeIncludesToday,
    };
}