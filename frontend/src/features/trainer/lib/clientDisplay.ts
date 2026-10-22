import { getInitials, avatarColor } from "../../calendar/lib/calendarWeek";
import type { TrainerClientResponse } from "../model/trainer.types";

export function clientName(client: TrainerClientResponse): string {
    const full = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
    return full || client.email;
}

export function clientInitials(client: TrainerClientResponse): string {
    return getInitials(client.firstName, client.lastName, client.email[0]?.toUpperCase() ?? "K");
}

export function clientColor(client: TrainerClientResponse): string {
    return avatarColor(client.id);
}

/** Archived ("заморожен") = deactivated: listed in the «Архив» tab, can't sign in. Deleted accounts (FIT-70) live there too. */
export function isArchivedClient(client: TrainerClientResponse): boolean {
    return client.status === "INACTIVE" || client.status === "DELETED";
}

/** The client deleted their own account: kept for history, can't be restored or edited. */
export function isDeletedClient(client: TrainerClientResponse): boolean {
    return client.status === "DELETED";
}

export type StatusPill = { label: string; cls: string };

export function clientStatusPill(client: TrainerClientResponse): StatusPill {
    if (client.status === "DELETED") {
        return { label: "аккаунт удалён", cls: "fb-pill--muted" };
    }
    if (client.status === "INACTIVE") {
        return { label: "в архиве", cls: "fb-pill--muted" };
    }
    if (client.claimedByClient) {
        return { label: "активен", cls: "fb-pill--ok" };
    }
    return { label: "приглашён", cls: "fb-pill--invite" };
}
