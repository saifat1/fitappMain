import {
    useEffect,
    useMemo,
    useState,
    type CSSProperties,
    type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { trainerApi } from "../shared/api/trainerApi";
import type {
    CreateManualTrainerClientRequest,
    InviteResponse,
    TrainerClientResponse,
    UpdateTrainerClientRequest,
} from "../features/trainer/model/trainer.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

type EditState = {
    firstName: string;
    lastName: string;
    contractNumber: string;
    contractEndDate: string;
};

type CreateClientState = {
    email: string;
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

    if (initials) {
        return initials;
    }

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

function getRegistrationStateLabel(client: TrainerClientResponse): string {
    if (client.claimedByClient) {
        return "Подтверждён";
    }

    if (client.createdByTrainer) {
        return "Ожидает подтверждения";
    }

    return "Создан через приглашение";
}

function formatCreatedAt(value: string): string {
    return new Date(value).toLocaleDateString("ru-RU");
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleString("ru-RU");
}

const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.42)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    zIndex: 1000,
};

const modalStyle: CSSProperties = {
    width: "100%",
    maxWidth: "560px",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.22)",
    padding: "20px",
};

const formGridStyle: CSSProperties = {
    display: "grid",
    gap: "12px",
};

const inputStyle: CSSProperties = {
    width: "100%",
    minHeight: "44px",
    padding: "0 14px",
    borderRadius: "12px",
    border: "1px solid #d7deea",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    boxSizing: "border-box",
};

const clientGridStyle: CSSProperties = {
    display: "grid",
    gap: "16px",
};

const clientCardStyle: CSSProperties = {
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    background: "#ffffff",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
    padding: "18px",
};

const clientHeaderStyle: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
};

const clientTitleWrapStyle: CSSProperties = {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    minWidth: 0,
};

const avatarStyle: CSSProperties = {
    width: "52px",
    height: "52px",
    borderRadius: "999px",
    background: "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
    color: "#1d4ed8",
    fontWeight: 800,
    fontSize: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 52px",
};

const statusRowStyle: CSSProperties = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "6px",
};

const metaStyle: CSSProperties = {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
    marginTop: "8px",
};

const actionRowStyle: CSSProperties = {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "16px",
};

const claimBadgeBaseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "28px",
    padding: "0 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
};

function getClaimBadgeStyle(client: TrainerClientResponse): CSSProperties {
    if (client.claimedByClient) {
        return {
            ...claimBadgeBaseStyle,
            background: "#dcfce7",
            color: "#166534",
        };
    }

    if (client.createdByTrainer) {
        return {
            ...claimBadgeBaseStyle,
            background: "#fef3c7",
            color: "#92400e",
        };
    }

    return {
        ...claimBadgeBaseStyle,
        background: "#e0f2fe",
        color: "#0369a1",
    };
}

export default function ClientsPage() {
    const navigate = useNavigate();

    const [clients, setClients] = useState<TrainerClientResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [editingClientId, setEditingClientId] = useState<number | null>(null);
    const [editState, setEditState] = useState<EditState>({
        firstName: "",
        lastName: "",
        contractNumber: "",
        contractEndDate: "",
    });

    const [savingClientId, setSavingClientId] = useState<number | null>(null);
    const [deactivatingClientId, setDeactivatingClientId] = useState<number | null>(null);
    const [inviteCreatingClientId, setInviteCreatingClientId] = useState<number | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [createClientState, setCreateClientState] = useState<CreateClientState>({
        email: "",
        firstName: "",
        lastName: "",
    });

    const [generatedInvite, setGeneratedInvite] = useState<InviteResponse | null>(null);
    const [generatedInviteClientName, setGeneratedInviteClientName] = useState("");
    const [copiedInviteId, setCopiedInviteId] = useState<number | null>(null);

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
        const awaitingClaim = clients.filter(
            (item) => item.status === "ACTIVE" && item.createdByTrainer && !item.claimedByClient
        ).length;

        return {
            total: clients.length,
            active,
            inactive,
            awaitingClaim,
        };
    }, [clients]);

    const sortedClients = useMemo(() => {
        return [...clients].sort((a, b) => {
            const aPending = a.createdByTrainer && !a.claimedByClient ? 1 : 0;
            const bPending = b.createdByTrainer && !b.claimedByClient ? 1 : 0;

            if (aPending !== bPending) {
                return bPending - aPending;
            }

            if (a.status !== b.status) {
                return a.status === "ACTIVE" ? -1 : 1;
            }

            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [clients]);

    const startEditing = (client: TrainerClientResponse) => {
        setEditingClientId(client.id);
        setEditState({
            firstName: client.firstName ?? "",
            lastName: client.lastName ?? "",
            contractNumber: client.contractNumber ?? "",
            contractEndDate: client.contractEndDate ?? "",
        });
    };

    const cancelEditing = () => {
        setEditingClientId(null);
        setEditState({
            firstName: "",
            lastName: "",
            contractNumber: "",
            contractEndDate: "",
        });
    };

    const handleSave = async (clientId: number) => {
        setErrorMessage("");
        setSavingClientId(clientId);

        const payload: UpdateTrainerClientRequest = {
            firstName: editState.firstName,
            lastName: editState.lastName,
            contractNumber: editState.contractNumber,
            contractEndDate: editState.contractEndDate || null,
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

    const handleCreateClient = async (event: FormEvent) => {
        event.preventDefault();
        setErrorMessage("");

        const payload: CreateManualTrainerClientRequest = {
            email: createClientState.email.trim(),
            firstName: createClientState.firstName.trim() || undefined,
            lastName: createClientState.lastName.trim() || undefined,
        };

        if (!payload.email) {
            setErrorMessage("Поле «Email» обязательно");
            return;
        }

        setIsCreatingClient(true);

        try {
            const created = await trainerApi.createManualClient(payload);
            setClients((prev) => [created, ...prev]);
            setCreateClientState({ email: "", firstName: "", lastName: "" });
            setIsCreateModalOpen(false);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось создать клиента"));
        } finally {
            setIsCreatingClient(false);
        }
    };

    const handleCreateInvite = async (client: TrainerClientResponse) => {
        setErrorMessage("");
        setInviteCreatingClientId(client.id);

        try {
            const invite = await trainerApi.createInviteForClient(client.id, {
                expiresInDays: 7,
            });

            setGeneratedInvite(invite);
            setGeneratedInviteClientName(getClientDisplayName(client));
            setCopiedInviteId(null);
        } catch (error) {
            setErrorMessage(
                resolveApiError(error, "Не удалось создать ссылку регистрации")
            );
        } finally {
            setInviteCreatingClientId(null);
        }
    };

    const handleCopyInvite = async () => {
        if (!generatedInvite) {
            return;
        }

        try {
            await navigator.clipboard.writeText(generatedInvite.registrationLink);
            setCopiedInviteId(generatedInvite.id);

            window.setTimeout(() => {
                setCopiedInviteId((current) =>
                    current === generatedInvite.id ? null : current
                );
            }, 1500);
        } catch {
            setErrorMessage("Не удалось скопировать ссылку");
        }
    };

    const openInvites = () => {
        navigate("/trainer/invites");
    };

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div>
                    <p className="dashboard-kicker">Клиенты</p>
                    <h1 className="dashboard-title">Управление клиентами</h1>
                    <p className="dashboard-subtitle">
                        Можно создавать клиента вручную, сразу ставить ему тренировки и при
                        необходимости позже отправлять ссылку для завершения регистрации.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-primary"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        + Создать клиента
                    </button>

                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary"
                        onClick={openInvites}
                    >
                        Приглашения
                    </button>

                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary"
                        onClick={() => void loadClients()}
                        disabled={isLoading}
                    >
                        {isLoading ? "Обновляем..." : "Обновить"}
                    </button>
                </div>
            </section>

            <section className="dashboard-grid">
                <article className="dashboard-card">
                    <h3>Всего</h3>
                    <p>{stats.total}</p>
                </article>

                <article className="dashboard-card">
                    <h3>Активные</h3>
                    <p>{stats.active}</p>
                </article>

                <article className="dashboard-card">
                    <h3>Ожидают подтверждения</h3>
                    <p>{stats.awaitingClaim}</p>
                </article>

                <article className="dashboard-card">
                    <h3>Неактивные</h3>
                    <p>{stats.inactive}</p>
                </article>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <section className="dashboard-card">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                        marginBottom: 16,
                    }}
                >
                    <div>
                        <h2 style={{ margin: 0, fontSize: 22 }}>Список клиентов</h2>
                        <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                            {sortedClients.length} записей
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div>Загрузка...</div>
                ) : !errorMessage && sortedClients.length === 0 ? (
                    <div>
                        <h3 style={{ marginTop: 0 }}>Клиентов пока нет</h3>
                        <p style={{ color: "#64748b" }}>
                            Создай первого клиента вручную или используй общий раздел приглашений.
                        </p>
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-primary"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            + Создать клиента
                        </button>
                    </div>
                ) : (
                    <div style={clientGridStyle}>
                        {sortedClients.map((client) => {
                            const isEditing = editingClientId === client.id;
                            const isSaving = savingClientId === client.id;
                            const isDeactivating = deactivatingClientId === client.id;
                            const isCreatingInvite = inviteCreatingClientId === client.id;
                            const canCreateInvite =
                                client.status === "ACTIVE" &&
                                client.createdByTrainer &&
                                !client.claimedByClient;

                            return (
                                <article key={client.id} style={clientCardStyle}>
                                    <div style={clientHeaderStyle}>
                                        <div style={clientTitleWrapStyle}>
                                            <div style={avatarStyle}>{getClientInitials(client)}</div>

                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontSize: 18,
                                                        fontWeight: 800,
                                                        color: "#0f172a",
                                                        lineHeight: 1.25,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    {getClientDisplayName(client)}
                                                </div>

                                                <div style={statusRowStyle}>
                          <span className={getClientStatusClass(client.status)}>
                            {getClientStatusLabel(client.status)}
                          </span>

                                                    <span style={getClaimBadgeStyle(client)}>
                            {getRegistrationStateLabel(client)}
                          </span>
                                                </div>

                                                <div style={metaStyle}>
                                                    <div>{client.email}</div>
                                                    <div>
                                                        ID {client.id} · Создан {formatCreatedAt(client.createdAt)}
                                                    </div>
                                                    <div style={metaStyle}>
                                                        ID {client.id} · Создан {formatCreatedAt(client.createdAt)}
                                                    </div>

                                                    <div style={metaStyle}>
                                                        Договор: {client.contractNumber?.trim() ? client.contractNumber : "—"}
                                                    </div>

                                                    <div style={metaStyle}>
                                                        Дата окончания договора: {client.contractEndDate ?? "—"}
                                                    </div>
                                                    {client.claimedByClient && (
                                                        <div>
                                                            Подтверждён: {formatDateTime(client.claimedAt)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!isEditing ? (
                                        <div style={actionRowStyle}>
                                            {canCreateInvite && (
                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-primary"
                                                    onClick={() => void handleCreateInvite(client)}
                                                    disabled={isCreatingInvite}
                                                >
                                                    {isCreatingInvite
                                                        ? "Создаём ссылку..."
                                                        : "Ссылка регистрации"}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className="dashboard-btn dashboard-btn-secondary"
                                                onClick={() => startEditing(client)}
                                            >
                                                Редактировать
                                            </button>
                                            <button
                                                type="button"
                                                className="dashboard-btn dashboard-btn-secondary"
                                                onClick={() => navigate(`/trainer/clients/${client.id}/history`)}
                                            >
                                                История
                                            </button>

                                            {client.status === "ACTIVE" && (
                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-secondary"
                                                    onClick={() => void handleDeactivate(client.id)}
                                                    disabled={isDeactivating}
                                                >
                                                    {isDeactivating ? "Деактивируем..." : "Деактивировать"}
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ ...formGridStyle, marginTop: 16 }}>
                                            <div style={{ display: "grid", gap: 6 }}>
                                                <label style={{ fontWeight: 600, fontSize: 14 }}>Имя</label>
                                                <input
                                                    value={editState.firstName}
                                                    onChange={(event) =>
                                                        setEditState((prev) => ({
                                                            ...prev,
                                                            firstName: event.target.value,
                                                        }))
                                                    }
                                                    style={inputStyle}
                                                    placeholder="Введите имя"
                                                />
                                            </div>

                                            <div style={{ display: "grid", gap: 6 }}>
                                                <label style={{ fontWeight: 600, fontSize: 14 }}>Фамилия</label>
                                                <input
                                                    value={editState.lastName}
                                                    onChange={(event) =>
                                                        setEditState((prev) => ({
                                                            ...prev,
                                                            lastName: event.target.value,
                                                        }))
                                                    }
                                                    style={inputStyle}
                                                    placeholder="Введите фамилию"
                                                />
                                            </div>
                                            <div style={formGridStyle}>
                                                <label>
                                                    Номер договора
                                                    <input
                                                        value={editState.contractNumber}
                                                        onChange={(event) =>
                                                            setEditState((prev) => ({
                                                                ...prev,
                                                                contractNumber: event.target.value,
                                                            }))
                                                        }
                                                        style={inputStyle}
                                                        placeholder="Введите номер договора"
                                                    />
                                                </label>

                                                <label>
                                                    Дата окончания договора
                                                    <input
                                                        type="date"
                                                        value={editState.contractEndDate}
                                                        onChange={(event) =>
                                                            setEditState((prev) => ({
                                                                ...prev,
                                                                contractEndDate: event.target.value,
                                                            }))
                                                        }
                                                        style={inputStyle}
                                                    />
                                                </label>
                                            </div>

                                            <div style={actionRowStyle}>
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

            {isCreateModalOpen && (
                <div
                    style={overlayStyle}
                    onClick={() => {
                        if (!isCreatingClient) {
                            setIsCreateModalOpen(false);
                        }
                    }}
                >
                    <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                                alignItems: "flex-start",
                                marginBottom: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, fontSize: 22 }}>Создать клиента</h3>
                                <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                                    Клиент появится в списке сразу. Ссылку регистрации можно создать позже.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary"
                                onClick={() => setIsCreateModalOpen(false)}
                                disabled={isCreatingClient}
                            >
                                Закрыть
                            </button>
                        </div>

                        <form onSubmit={handleCreateClient} style={formGridStyle}>
                            <div style={{ display: "grid", gap: 6 }}>
                                <label style={{ fontWeight: 600, fontSize: 14 }}>Email</label>
                                <input
                                    type="email"
                                    value={createClientState.email}
                                    onChange={(event) =>
                                        setCreateClientState((prev) => ({
                                            ...prev,
                                            email: event.target.value,
                                        }))
                                    }
                                    style={inputStyle}
                                    placeholder="client@test.local"
                                    required
                                />
                            </div>

                            <div style={{ display: "grid", gap: 6 }}>
                                <label style={{ fontWeight: 600, fontSize: 14 }}>Имя</label>
                                <input
                                    value={createClientState.firstName}
                                    onChange={(event) =>
                                        setCreateClientState((prev) => ({
                                            ...prev,
                                            firstName: event.target.value,
                                        }))
                                    }
                                    style={inputStyle}
                                    placeholder="Необязательно"
                                />
                            </div>

                            <div style={{ display: "grid", gap: 6 }}>
                                <label style={{ fontWeight: 600, fontSize: 14 }}>Фамилия</label>
                                <input
                                    value={createClientState.lastName}
                                    onChange={(event) =>
                                        setCreateClientState((prev) => ({
                                            ...prev,
                                            lastName: event.target.value,
                                        }))
                                    }
                                    style={inputStyle}
                                    placeholder="Необязательно"
                                />
                            </div>

                            <div style={actionRowStyle}>
                                <button
                                    type="submit"
                                    className="dashboard-btn dashboard-btn-primary"
                                    disabled={isCreatingClient}
                                >
                                    {isCreatingClient ? "Создаём..." : "Создать клиента"}
                                </button>

                                <button
                                    type="button"
                                    className="dashboard-btn dashboard-btn-secondary"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    disabled={isCreatingClient}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {generatedInvite && (
                <div
                    style={overlayStyle}
                    onClick={() => {
                        setGeneratedInvite(null);
                        setGeneratedInviteClientName("");
                        setCopiedInviteId(null);
                    }}
                >
                    <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                                alignItems: "flex-start",
                                marginBottom: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            <div>
                                <h3 style={{ margin: 0, fontSize: 22 }}>Ссылка регистрации</h3>
                                <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                                    {generatedInviteClientName}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary"
                                onClick={() => {
                                    setGeneratedInvite(null);
                                    setGeneratedInviteClientName("");
                                    setCopiedInviteId(null);
                                }}
                            >
                                Закрыть
                            </button>
                        </div>

                        <div style={{ display: "grid", gap: 10 }}>
                            <div style={{ color: "#64748b", fontSize: 14 }}>
                                Срок действия: {formatDateTime(generatedInvite.expiresAt)}
                            </div>

                            <div
                                style={{
                                    border: "1px solid #d7deea",
                                    borderRadius: 14,
                                    background: "#f8fafc",
                                    padding: 14,
                                    wordBreak: "break-all",
                                    fontSize: 14,
                                    lineHeight: 1.5,
                                }}
                            >
                                {generatedInvite.registrationLink}
                            </div>

                            <div style={actionRowStyle}>
                                <button
                                    type="button"
                                    className="dashboard-btn dashboard-btn-primary"
                                    onClick={() => void handleCopyInvite()}
                                >
                                    {copiedInviteId === generatedInvite.id
                                        ? "Скопировано"
                                        : "Копировать ссылку"}
                                </button>

                                <button
                                    type="button"
                                    className="dashboard-btn dashboard-btn-secondary"
                                    onClick={openInvites}
                                >
                                    Открыть приглашения
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}