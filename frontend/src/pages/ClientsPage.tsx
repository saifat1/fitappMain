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
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось загрузить клиентов");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadClients();
    }, []);

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
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось обновить клиента");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
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
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось деактивировать клиента");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setDeactivatingClientId(null);
        }
    };

    const stats = useMemo(() => {
        const active = clients.filter((item) => item.status === "ACTIVE").length;
        const inactive = clients.filter((item) => item.status === "INACTIVE").length;

        return {
            total: clients.length,
            active,
            inactive,
        };
    }, [clients]);

    return (
        <div className="clients-page">
            <section className="clients-hero">
                <div className="clients-hero-main">
                    <div className="clients-kicker">Клиенты</div>
                    <h1 className="clients-title">Клиентская база тренера</h1>
                    <p className="clients-subtitle">
                        Просматривай список клиентов, редактируй данные и контролируй их статус
                        без перегрузки таблицами и лишними действиями.
                    </p>
                </div>

                <div className="clients-hero-stats">
                    <div className="clients-stat-card">
                        <span>Всего клиентов</span>
                        <strong>{stats.total}</strong>
                    </div>
                    <div className="clients-stat-card">
                        <span>Активные</span>
                        <strong>{stats.active}</strong>
                    </div>
                    <div className="clients-stat-card">
                        <span>Неактивные</span>
                        <strong>{stats.inactive}</strong>
                    </div>
                </div>
            </section>

            <section className="clients-panel">
                <div className="clients-panel-header">
                    <div>
                        <div className="clients-panel-kicker">Список</div>
                        <h2 className="clients-panel-title">Все клиенты</h2>
                    </div>

                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary"
                        onClick={loadClients}
                        disabled={isLoading}
                    >
                        {isLoading ? "Обновляем..." : "Обновить"}
                    </button>
                </div>

                {isLoading && <p>Загрузка...</p>}
                {errorMessage && <div className="error-box">{errorMessage}</div>}

                {!isLoading && !errorMessage && clients.length === 0 && (
                    <div className="clients-empty">
                        <div className="clients-empty-title">Клиентов пока нет</div>
                        <div className="clients-empty-text">
                            Здесь появятся пользователи, закреплённые за тренером.
                        </div>
                    </div>
                )}

                {!isLoading && !errorMessage && clients.length > 0 && (
                    <div className="clients-list">
                        {clients.map((client) => {
                            const isEditing = editingClientId === client.id;
                            const isSaving = savingClientId === client.id;
                            const isDeactivating = deactivatingClientId === client.id;

                            return (
                                <article key={client.id} className="client-card">
                                    <div className="client-card-top">
                                        <div className="client-card-main">
                                            <div className="client-avatar">{getClientInitials(client)}</div>
                                            <div>
                                                <h3 className="client-card-title">{getClientDisplayName(client)}</h3>
                                                <div className="client-card-email">{client.email}</div>
                                            </div>
                                        </div>

                                        <span className={getClientStatusClass(client.status)}>
                      {getClientStatusLabel(client.status)}
                    </span>
                                    </div>

                                    {!isEditing ? (
                                        <>
                                            <div className="client-card-grid">
                                                <div className="client-card-item">
                                                    <span>ID</span>
                                                    <strong>{client.id}</strong>
                                                </div>

                                                <div className="client-card-item">
                                                    <span>Имя</span>
                                                    <strong>{client.firstName ?? "—"}</strong>
                                                </div>

                                                <div className="client-card-item">
                                                    <span>Фамилия</span>
                                                    <strong>{client.lastName ?? "—"}</strong>
                                                </div>

                                                <div className="client-card-item">
                                                    <span>Создан</span>
                                                    <strong>{new Date(client.createdAt).toLocaleString()}</strong>
                                                </div>
                                            </div>

                                            <div className="client-card-actions">
                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-primary"
                                                    onClick={() => startEditing(client)}
                                                >
                                                    Редактировать
                                                </button>

                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-secondary"
                                                    onClick={() => handleDeactivate(client.id)}
                                                    disabled={isDeactivating || client.status === "INACTIVE"}
                                                >
                                                    {isDeactivating ? "Деактивируем..." : "Деактивировать"}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="trainings-form">
                                            <div className="clients-edit-title">Редактирование клиента</div>

                                            <div className="trainings-form-grid">
                                                <div className="form-row">
                                                    <label htmlFor={`client-first-name-${client.id}`}>Имя</label>
                                                    <input
                                                        id={`client-first-name-${client.id}`}
                                                        type="text"
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
                                                        type="text"
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

                                            <div className="client-card-actions">
                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-primary"
                                                    onClick={() => handleSave(client.id)}
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
                    </div>
                )}
            </section>
        </div>
    );
}