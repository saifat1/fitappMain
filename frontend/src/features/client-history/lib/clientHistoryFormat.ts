import type {
    ClientHistoryClient,
    ClientHistoryExercise,
    ClientHistoryTraining,
    ClientHistoryTrainingStatus,
} from "../model/clientHistory.types";

export function formatClientDisplayName(client: ClientHistoryClient): string {
    const fullName = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
    return fullName || "Клиент без имени";
}

export function formatTrainingStatus(status: ClientHistoryTrainingStatus): string {
    switch (status) {
        case "PLANNED":
            return "Запланирована";
        case "COMPLETED":
            return "Завершена";
        case "CANCELLED":
            return "Отменена";
        default:
            return status;
    }
}

export function formatTrainingDateLabel(trainingDate: string): string {
    return new Date(trainingDate).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        weekday: "short",
    });
}

function normalizeTime(value?: string | null): string {
    if (!value) {
        return "";
    }

    return value.slice(0, 5);
}

export function formatTrainingTimeRange(
    startTime?: string | null,
    endTime?: string | null
): string {
    const start = normalizeTime(startTime);
    const end = normalizeTime(endTime);

    if (start && end) {
        return `${start}–${end}`;
    }

    if (start) {
        return start;
    }

    return "Время не указано";
}

export function formatWeightDisplay(weight?: number | null): string {
    if (weight == null) {
        return "—";
    }

    return `${weight} кг`;
}

export function formatExerciseSummary(exercise: ClientHistoryExercise): string {
    const parts: string[] = [];

    if (exercise.sets != null) {
        parts.push(`${exercise.sets} подх.`);
    }

    if (exercise.repsMode !== "NONE" && exercise.repsDisplay) {
        parts.push(`${exercise.repsDisplay} повт.`);
    }

    if (exercise.weight != null) {
        parts.push(`${exercise.weight} кг`);
    }

    if (exercise.durationSeconds != null) {
        parts.push(`${exercise.durationSeconds} сек.`);
    }

    if (exercise.restSeconds != null) {
        parts.push(`отдых ${exercise.restSeconds} сек.`);
    }

    return parts.length > 0 ? parts.join(" • ") : "Параметры не заданы";
}

export function hasTrainingNotes(training: ClientHistoryTraining): boolean {
    if (training.trainerNote?.trim() || training.clientNote?.trim()) {
        return true;
    }

    return training.exercises.some(
        (exercise) => Boolean(exercise.trainerNote?.trim()) || Boolean(exercise.clientNote?.trim())
    );
}

export function getCompletedExercisesCount(training: ClientHistoryTraining): number {
    return training.exercises.filter((exercise) => exercise.isCompleted).length;
}

export function getCompletionRate(training: ClientHistoryTraining): number {
    if (training.exercises.length === 0) {
        return 0;
    }

    return Math.round((getCompletedExercisesCount(training) / training.exercises.length) * 100);
}