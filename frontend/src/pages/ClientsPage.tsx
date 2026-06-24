import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import Avatar from "../shared/ui/Avatar";
import { trainerApi } from "../shared/api/trainerApi";
import {
    clientName,
    clientInitials,
    clientColor,
    clientStatusPill,
} from "../features/trainer/lib/clientDisplay";
import type { TrainerClientResponse } from "../features/trainer/model/trainer.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ClientsPage() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<TrainerClientResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const data = await trainerApi.getClients();
            setClients(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить клиентов"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const sorted = [...clients].sort((a, b) => clientName(a).localeCompare(clientName(b)));

    return (
        <MobileShell
            title="Клиенты"
            fab={
                <button
                    type="button"
                    className="fb-fab"
                    aria-label="Новый клиент"
                    onClick={() => navigate("/trainer/clients/new")}
                >
                    +
                </button>
            }
        >
            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            {isLoading ? (
                <div className="fb-empty">Загрузка…</div>
            ) : sorted.length === 0 ? (
                <div className="fb-empty">Клиентов пока нет</div>
            ) : (
                <div className="fb-list">
                    {sorted.map((client) => {
                        const pill = clientStatusPill(client);
                        return (
                            <button
                                key={client.id}
                                type="button"
                                className="fb-row fb-row--button"
                                onClick={() => navigate(`/trainer/clients/${client.id}`)}
                            >
                                <Avatar initials={clientInitials(client)} color={clientColor(client)} size="md" />
                                <span className="fb-row__main">
                                    <span className="fb-row__title">{clientName(client)}</span>
                                    <span className="fb-row__sub">{client.email}</span>
                                </span>
                                <span className={`fb-pill ${pill.cls}`}>{pill.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </MobileShell>
    );
}
