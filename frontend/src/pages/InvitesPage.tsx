import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { trainerApi } from "../shared/api/trainerApi";
import type {
    CreateInviteRequest,
    InviteResponse,
} from "../features/trainer/model/trainer.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function getInviteStatusLabel(status: string): string {
    switch (status) {
        case "NEW":
            return "Активно";
        case "USED":
            return "Использовано";
        case "EXPIRED":
            return "Истекло";
        case "CANCELLED":
            return "Отменено";
        default:
            return status;
    }
}

function getInviteStatusClass(status: string): string {
    switch (status) {
        case "NEW":
            return "invite-status-badge active";
        case "USED":
            return "invite-status-badge used";
        case "EXPIRED":
            return "invite-status-badge expired";
        case "CANCELLED":
            return "invite-status-badge cancelled";
        default:
            return "invite-status-badge";
    }
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleString("ru-RU");
}

export default function InvitesPage() {
    const [invites, setInvites] = useState<InviteResponse[]>([]);
    const [email, setEmail] = useState("");
    const [expiresInDays, setExpiresInDays] = useState("7");
    const [showAll, setShowAll] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [copiedInviteId, setCopiedInviteId] = useState<number | null>(null);
    const [deletingInviteId, setDeletingInviteId] = useState<number | null>(null);

    const loadInvites = useCallback(async () => {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await trainerApi.getInvites(showAll);
            setInvites(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить приглашения"));
        } finally {
            setIsLoading(false);
        }
    }, [showAll]);

    useEffect(() => {
        void loadInvites();
    }, [loadInvites]);

    const stats = useMemo(() => {
        const active = invites.filter((item) => item.status === "NEW").length;
        const used = invites.filter((item) => item.status === "USED").length;
        const expired = invites.filter((item) => item.status === "EXPIRED").length;
        const cancelled = invites.filter((item) => item.status === "CANCELLED").length;

        return {
            total: invites.length,
            active,
            used,
            expired,
            cancelled,
        };
    }, [invites]);

    const handleCreateInvite = async (event: FormEvent) => {
        event.preventDefault();
        setErrorMessage("");

        const trimmedEmail = email.trim();
        const trimmedExpiresInDays = expiresInDays.trim();

        if (!trimmedEmail) {
            setErrorMessage("Поле «Email клиента» обязательно");
            return;
        }

        if (!trimmedExpiresInDays) {
            setErrorMessage("Поле «Срок действия, дней» обязательно");
            return;
        }

        const expiresInDaysNumber = Number(trimmedExpiresInDays);

        if (!Number.isInteger(expiresInDaysNumber) || expiresInDaysNumber <= 0) {
            setErrorMessage("Срок действия должен быть положительным целым числом");
            return;
        }

        setIsSubmitting(true);

        const payload: CreateInviteRequest = {
            email: trimmedEmail,
            expiresInDays: expiresInDaysNumber,
        };

        try {
            const created = await trainerApi.createInvite(payload);
            if (!showAll || created.status === "NEW") {
                setInvites((prev) => [created, ...prev]);
            }
            setEmail("");
            setExpiresInDays("7");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось создать приглашение"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = async (invite: InviteResponse) => {
        try {
            await navigator.clipboard.writeText(invite.registrationLink);
            setCopiedInviteId(invite.id);

            window.setTimeout(() => {
                setCopiedInviteId((current) => (current === invite.id ? null : current));
            }, 1500);
        } catch {
            setErrorMessage("Не удалось скопировать ссылку");
        }
    };

    const handleDelete = async (inviteId: number) => {
        const confirmed = window.confirm("Удалить приглашение?");
        if (!confirmed) {
            return;
        }

        setDeletingInviteId(inviteId);
        setErrorMessage("");

        try {
            await trainerApi.deleteInvite(inviteId);
            setInvites((prev) => prev.filter((item) => item.id !== inviteId));
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось удалить приглашение"));
        } finally {
            setDeletingInviteId(null);
        }
    };

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div>
                    <p className="dashboard-kicker">Приглашения</p>
                    <h1 className="dashboard-title">Ссылки регистрации</h1>
                    <p className="dashboard-subtitle">
                        Здесь остаётся старый общий сценарий приглашений и отображаются ссылки,
                        созданные для уже существующих клиентов.
                    </p>
                </div>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary"
                    onClick={() => void loadInvites()}
                    disabled={isLoading}
                >
                    {isLoading ? "Обновляем..." : "Обновить"}
                </button>
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
                    <h3>Использованы</h3>
                    <p>{stats.used}</p>
                </article>

                <article className="dashboard-card">
                    <h3>Архив</h3>
                    <p>{stats.expired + stats.cancelled}</p>
                </article>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <section className="dashboard-card">
                <h2 style={{ marginTop: 0 }}>Новое приглашение</h2>

                <form
                    onSubmit={handleCreateInvite}
                    style={{
                        display: "grid",
                        gap: 12,
                        gridTemplateColumns: "minmax(0, 1fr) 180px auto",
                        alignItems: "end",
                    }}
                >
                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                            Email клиента
                        </label>
                        <input
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="client@test.local"
                            required
                            style={{
                                width: "100%",
                                minHeight: 44,
                                padding: "0 14px",
                                borderRadius: 12,
                                border: "1px solid #d7deea",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                            Срок, дней
                        </label>
                        <input
                            value={expiresInDays}
                            onChange={(event) => setExpiresInDays(event.target.value)}
                            required
                            inputMode="numeric"
                            style={{
                                width: "100%",
                                minHeight: 44,
                                padding: "0 14px",
                                borderRadius: 12,
                                border: "1px solid #d7deea",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="dashboard-btn dashboard-btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Создаём..." : "Создать"}
                    </button>
                </form>
            </section>

            <section className="dashboard-card">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: 16,
                    }}
                >
                    <h2 style={{ margin: 0 }}>Список приглашений</h2>

                    <label
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            color: "#64748b",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={showAll}
                            onChange={(event) => setShowAll(event.target.checked)}
                        />
                        Показывать все
                    </label>
                </div>

                {isLoading ? (
                    <div>Загрузка...</div>
                ) : invites.length === 0 ? (
                    <div>
                        <h3 style={{ marginTop: 0 }}>Приглашений нет</h3>
                        <p style={{ color: "#64748b" }}>
                            Создай первое приглашение для нового клиента.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                        {invites.map((invite) => {
                            const isDeleting = deletingInviteId === invite.id;
                            const isCopied = copiedInviteId === invite.id;

                            return (
                                <article
                                    key={invite.id}
                                    style={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: 18,
                                        background: "#ffffff",
                                        padding: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            alignItems: "flex-start",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: 800,
                                                    color: "#0f172a",
                                                    lineHeight: 1.25,
                                                }}
                                            >
                                                {invite.email ?? "Без привязки к email"}
                                            </div>

                                            <div style={{ marginTop: 6 }}>
                        <span className={getInviteStatusClass(invite.status)}>
                          {getInviteStatusLabel(invite.status)}
                        </span>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: 8,
                                                    color: "#64748b",
                                                    fontSize: 13,
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                <div>ID {invite.id}</div>
                                                {invite.clientId != null && <div>Клиент ID {invite.clientId}</div>}
                                                <div>Истекает {formatDateTime(invite.expiresAt)}</div>
                                                <div>Использовано {formatDateTime(invite.usedAt)}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            <button
                                                type="button"
                                                className="dashboard-btn dashboard-btn-secondary"
                                                onClick={() => void handleCopy(invite)}
                                            >
                                                {isCopied ? "Скопировано" : "Копировать"}
                                            </button>

                                            <button
                                                type="button"
                                                className="dashboard-btn dashboard-btn-secondary"
                                                onClick={() => void handleDelete(invite.id)}
                                                disabled={isDeleting}
                                                title="Удалить"
                                            >
                                                {isDeleting ? "Удаляем..." : "Удалить"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}