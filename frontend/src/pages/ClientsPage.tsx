import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { trainerApi } from "../shared/api/trainerApi";
import type {
    TrainerClientResponse,
    UpdateTrainerClientRequest,
} from "../features/trainer/model/trainer.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

type EditState = {
    firstName: string;
    lastName: string;
};

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function getClientDisplayName(client: TrainerClientResponse): string {
    const fullName = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
    return fullName || "Имя не заполнено";
}

function getClientInitials(client: TrainerClientResponse): string {
    const first = client.firstName?.[0] ?? "";
    const last = client.lastName?.[0] ?? "";
    const initials = `${first}${last}`.trim().toUpperCase();

    if (initials) return initials;
    return client.email?.[0]?.toUpperCase() ?? "C";
}

function getClientStatusLabel(status: string): string {
    switch (status) {
        case "ACTIVE":
            return "Активный";
        case "INACTIVE":
            return "Неактивный";
        default:
            return status;
    }
}

function getClientStatusClass(status: string): string {
    switch (status) {
        case "ACTIVE":
            return "client-status-badge active";
        case "INACTIVE":
            return "client-status-badge inactive";
        default:
            return "client-status-badge";
    }
}

function formatCreatedAt(value: string): string {
    return new Date(value).toLocaleDateString();
}

export default function ClientsPage() {
    const [clients, setClients] = useState<TrainerClientResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [editState, setEditState] = useState<EditState>({
        firstName: "",
        lastName: "",
    });

    const [savingClientId, setSavingClientId] = useState<number | null>(null);
    const [deactivatingClientId, setDeactivatingClientId] = useState<number | null>(null);

    async function loadClients() {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await trainerApi.getClients();
            setClients(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить клиентов"));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadClients();
    }, []);

    const stats = useMemo(() => {
        const active = clients.filter((item) => item.status === "ACTIVE").length;
        const inactive = clients.filter((item) => item.status === "INACTIVE").length;

        return {
            total: clients.length,
            active,
            inactive,
        };
    }, [clients]);

    const startEditing = (client: TrainerClientResponse) => {
        setEditingClientId(client.id);
        setEditState({
            firstName: client.firstName ?? "",
            lastName: client.lastName ?? "",
        });
    };

    const cancelEditing = () => {
        setEditingClientId(null);
        setEditState({
            firstName: "",
            lastName: "",
        });
    };

    const handleSave = async (clientId: number) => {
        setErrorMessage("");
        setSavingClientId(clientId);

        const payload: UpdateTrainerClientRequest = {
            firstName: editState.firstName,
            lastName: editState.lastName,
        };

        try {
            const updated = await trainerApi.updateClient(clientId, payload);
            setClients((prev) =>
                prev.map((client) => (client.id === clientId ? updated : client))
            );
            cancelEditing();
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось обновить клиента"));
        } finally {
            setSavingClientId(null);
        }
    };

    const handleDeactivate = async (clientId: number) => {
        const confirmed = window.confirm("Деактивировать клиента?");
        if (!confirmed) {
            return;
        }

        setErrorMessage("");
        setDeactivatingClientId(clientId);

        try {
            await trainerApi.deactivateClient(clientId);
            setClients((prev) =>
                prev.map((client) =>
                    client.id === clientId ? { ...client, status: "INACTIVE" } : client
                )
            );
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось деактивировать клиента"));
        } finally {
            setDeactivatingClientId(null);
        }
    };

    return (
        <div className="clients-page clients-page-compact entity-page-compact">
            <section className="clients-header-bar entity-header-bar">
                <div className="clients-header-main entity-header-main">
                    <h1 className="clients-header-title entity-header-title">Клиенты</h1>

                    <div className="clients-summary-row entity-summary-row">
            <span className="clients-summary-chip entity-summary-chip">
              <strong>{stats.total}</strong>
              <span>Всего</span>
            </span>

                        <span className="clients-summary-chip active entity-summary-chip entity-summary-chip--positive">
              <strong>{stats.active}</strong>
              <span>Активные</span>
            </span>

                        <span className="clients-summary-chip inactive entity-summary-chip entity-summary-chip--muted">
              <strong>{stats.inactive}</strong>
              <span>Неактивные</span>
            </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary clients-refresh-btn entity-header-action"
                    onClick={() => void loadClients()}
                    disabled={isLoading}
                >
                    {isLoading ? "Обновляем..." : "Обновить"}
                </button>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <section className="clients-panel clients-panel-compact entity-panel-compact">
                <div className="clients-section-head entity-section-head">
                    <h2 className="clients-section-title entity-section-title">Список клиентов</h2>
                    <span className="clients-section-count entity-section-count">{clients.length}</span>
                </div>

                {isLoading ? (
                    <div className="clients-empty-text">Загрузка...</div>
                ) : !errorMessage && clients.length === 0 ? (
                    <div className="clients-empty">
                        <div className="clients-empty-title">Клиентов пока нет</div>
                        <div className="clients-empty-text">
                            Здесь появятся пользователи, закреплённые за тренером.
                        </div>
                    </div>
                ) : (
                    <section className="clients-list clients-list-compact entity-list-compact">
                        {clients.map((client) => {
                            const isEditing = editingClientId === client.id;
                            const isSaving = savingClientId === client.id;
                            const isDeactivating = deactivatingClientId === client.id;

                            return (
                                <article
                                    key={client.id}
                                    className="client-card client-card-compact entity-card-compact"
                                >
                                    <div className="client-card-row entity-card-row">
                                        <div className="client-avatar client-avatar-compact">
                                            {getClientInitials(client)}
                                        </div>

                                        <div className="client-card-content entity-card-main">
                                            <div className="client-card-name-row">
                                                <div className="client-card-name">{getClientDisplayName(client)}</div>
                                                <div className={getClientStatusClass(client.status)}>
                                                    {getClientStatusLabel(client.status)}
                                                </div>
                                            </div>

                                            <div className="client-card-email">{client.email}</div>

                                            <div className="client-card-meta-row entity-meta-row">
                                                <span>ID {client.id}</span>
                                                <span>Создан {formatCreatedAt(client.createdAt)}</span>
                                            </div>
                                        </div>

                                        {!isEditing && (
                                            <div className="client-card-actions client-card-actions-compact entity-actions-compact">
                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-secondary client-action-btn entity-secondary-btn"
                                                    onClick={() => startEditing(client)}
                                                >
                                                    Редактировать
                                                </button>

                                                {client.status === "ACTIVE" && (
                                                    <button
                                                        type="button"
                                                        className="card-action-btn card-action-btn-danger client-icon-action entity-icon-btn"
                                                        onClick={() => void handleDeactivate(client.id)}
                                                        disabled={isDeactivating}
                                                        title="Деактивировать"
                                                    >
                                                        {isDeactivating ? "..." : "×"}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <div className="client-edit-inline">
                                            <div className="client-edit-grid entity-inline-form entity-inline-form--2">
                                                <div className="form-row">
                                                    <label htmlFor={`client-first-name-${client.id}`}>Имя</label>
                                                    <input
                                                        id={`client-first-name-${client.id}`}
                                                        value={editState.firstName}
                                                        onChange={(event) =>
                                                            setEditState((prev) => ({
                                                                ...prev,
                                                                firstName: event.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>

                                                <div className="form-row">
                                                    <label htmlFor={`client-last-name-${client.id}`}>Фамилия</label>
                                                    <input
                                                        id={`client-last-name-${client.id}`}
                                                        value={editState.lastName}
                                                        onChange={(event) =>
                                                            setEditState((prev) => ({
                                                                ...prev,
                                                                lastName: event.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="client-edit-actions">
                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-primary"
                                                    onClick={() => void handleSave(client.id)}
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? "Сохраняем..." : "Сохранить"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-secondary"
                                                    onClick={cancelEditing}
                                                    disabled={isSaving}
                                                >
                                                    Отмена
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </section>
                )}
            </section>
        </div>
    );
}