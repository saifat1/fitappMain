import type {
    ClientHistoryFiltersState,
    ClientHistoryTraining,
} from "../model/clientHistory.types";
import { hasTrainingNotes } from "./clientHistoryFormat";

function parseDateOnly(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function isWithinPeriod(trainingDate: string, period: ClientHistoryFiltersState["period"]): boolean {
    if (period === "all") {
        return true;
    }

    const now = new Date();
    const from = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    from.setDate(now.getDate() - days);

    const date = parseDateOnly(trainingDate);
    return date >= from;
}

function matchesQuery(training: ClientHistoryTraining, query: string): boolean {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
        return true;
    }

    const haystack = [
        training.id,
        training.trainingDate,
        training.startTime,
        training.endTime,
        training.status,
        training.trainerNote,
        training.clientNote,
        ...training.exercises.flatMap((exercise) => [
            exercise.title,
            exercise.description,
            exercise.repsDisplay,
            exercise.trainerNote,
            exercise.clientNote,
            exercise.weight != null ? String(exercise.weight) : "",
        ]),
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return haystack.includes(normalized);
}

export function filterClientHistoryTrainings(
    trainings: ClientHistoryTraining[],
    filters: ClientHistoryFiltersState
): ClientHistoryTraining[] {
    return trainings.filter((training) => {
        if (!isWithinPeriod(training.trainingDate, filters.period)) {
            return false;
        }

        if (filters.status !== "ALL" && training.status !== filters.status) {
            return false;
        }

        if (filters.showOnlyWithNotes && !hasTrainingNotes(training)) {
            return false;
        }

        if (!matchesQuery(training, filters.query)) {
            return false;
        }

        return true;
    });
}

export function buildClientHistoryStats(trainings: ClientHistoryTraining[]) {
    const total = trainings.length;
    const completed = trainings.filter((training) => training.status === "COMPLETED").length;
    const cancelled = trainings.filter((training) => training.status === "CANCELLED").length;
    const planned = trainings.filter((training) => training.status === "PLANNED").length;

    const latestTraining = trainings.length > 0 ? trainings[0] : null;

    const totalExercises = trainings.reduce(
        (acc, training) => acc + training.exercises.length,
        0
    );
    const completedExercises = trainings.reduce(
        (acc, training) =>
            acc + training.exercises.filter((exercise) => exercise.isCompleted).length,
        0
    );

    const completionRate =
        totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

    return {
        total,
        completed,
        cancelled,
        planned,
        latestTraining,
        completionRate,
    };
}