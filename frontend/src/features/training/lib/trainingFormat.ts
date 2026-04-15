import type { TrainingResponse } from "../model/training.types";
import type { TrainerClientResponse } from "../../trainer/model/trainer.types";

export function formatTimeRange(startTime: string | null, endTime: string | null): string {
    if (!startTime && !endTime) {
        return "Время не указано";
    }

    if (startTime && endTime) {
        return `${startTime} - ${endTime}`;
    }

    return startTime ?? endTime ?? "Время не указано";
}

export function formatClientName(training: TrainingResponse): string {
    const fullName = [training.clientFirstName, training.clientLastName]
        .filter(Boolean)
        .join(" ");

    if (fullName) {
        return `${fullName} (${training.clientEmail})`;
    }

    return training.clientEmail;
}

export function formatClientOption(client: TrainerClientResponse): string {
    const fullName = [client.firstName, client.lastName].filter(Boolean).join(" ");

    if (fullName) {
        return `${fullName} (${client.email})`;
    }

    return client.email;
}

export function getStatusLabel(status: string): string {
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

export function getStatusClass(status: string): string {
    switch (status) {
        case "PLANNED":
            return "training-status-badge planned";
        case "COMPLETED":
            return "training-status-badge completed";
        case "CANCELLED":
            return "training-status-badge cancelled";
        default:
            return "training-status-badge";
    }
}