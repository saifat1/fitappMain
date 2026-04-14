import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { trainerApi } from "../shared/api/trainerApi";
import type {
    CreateInviteRequest,
    InviteResponse,
} from "../features/trainer/model/trainer.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function getInviteStatusLabel(status: string): string {
    switch (status) {
        case "NEW":
            return "Новое";
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

export default function InvitesPage() {
    const [invites, setInvites] = useState<InviteResponse[]>([]);
    const [email, setEmail] = useState("client@test.local");
    const [expiresInDays, setExpiresInDays] = useState("7");
    const [showAllInvites, setShowAllInvites] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [copiedInviteId, setCopiedInviteId] = useState<number | null>(null);
    const [deletingInviteId, setDeletingInviteId] = useState<number | null>(null);

    const loadInvites = useCallback(async () => {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await trainerApi.getInvites(showAllInvites);
            setInvites(data);
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось загрузить приглашения");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsLoading(false);
        }
    }, [showAllInvites]);

    useEffect(() => {
        void loadInvites();
    }, [loadInvites]);

    const handleCreateInvite = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");

        const trimmedEmail = email.trim();
        const trimmedExpiresInDays = expiresInDays.trim();

        if (!trimmedEmail) {
            setErrorMessage("Укажи email клиента");
            return;
        }

        if (!trimmedExpiresInDays) {
            setErrorMessage("Укажи срок действия приглашения");
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
            await trainerApi.createInvite(payload);
            await loadInvites();
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось создать приглашение");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
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

        setErrorMessage("");
        setDeletingInviteId(inviteId);

        try {
            await trainerApi.deleteInvite(inviteId);
            setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось удалить приглашение");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setDeletingInviteId(null);
        }
    };

    const stats = useMemo(() => {
        const newCount = invites.filter((item) => item.status === "NEW").length;
        const used = invites.filter((item) => item.status === "USED").length;
        const expired = invites.filter((item) => item.status === "EXPIRED").length;
        const cancelled = invites.filter((item) => item.status === "CANCELLED").length;

        return {
            total: invites.length,
            newCount,
            used,
            expired,
            cancelled,
        };
    }, [invites]);

    return (
        <div className="invites-page">
            <section className="invites-hero">
                <div className="invites-hero-main">
                    <div className="invites-kicker">Приглашения</div>
                    <h1 className="invites-title">Invite-ссылки для клиентов</h1>
                    <p className="invites-subtitle">
                        Создавай новые приглашения, отслеживай их статус и быстро копируй
                        ссылку для отправки клиенту.
                    </p>
                </div>

                <div className="invites-hero-stats">
                    <div className="invites-stat-card">
                        <span>Всего</span>
                        <strong>{stats.total}</strong>
                    </div>

                    <div className="invites-stat-card">
                        <span>Новые</span>
                        <strong>{stats.newCount}</strong>
                    </div>

                    <div className="invites-stat-card">
                        <span>Использованные</span>
                        <strong>{stats.used}</strong>
                    </div>

                    <div className="invites-stat-card">
                        <span>Истекшие / отменённые</span>
                        <strong>{stats.expired + stats.cancelled}</strong>
                    </div>
                </div>
            </section>

            <section className="invites-panel">
                <div className="invites-panel-header">
                    <div>
                        <div className="invites-panel-kicker">Создание</div>
                        <h2 className="invites-panel-title">Новое приглашение</h2>
                    </div>
                </div>

                <form className="trainings-form" onSubmit={handleCreateInvite}>
                    <div className="trainings-form-grid">
                        <div className="form-row">
                            <label htmlFor="invite-email">Email клиента</label>
                            <input
                                id="invite-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="client@test.local"
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="invite-expiration">Срок действия, дней</label>
                            <input
                                id="invite-expiration"
                                type="number"
                                min="1"
                                max="365"
                                value={expiresInDays}
                                onChange={(event) => setExpiresInDays(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="invites-actions">
                        <button
                            type="submit"
                            className="dashboard-btn dashboard-btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Создаём..." : "Создать приглашение"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="invites-panel">
                <div className="invites-panel-header invites-panel-header-with-controls">
                    <div>
                        <div className="invites-panel-kicker">Список</div>
                        <h2 className="invites-panel-title">
                            {showAllInvites ? "Все приглашения" : "Новые приглашения"}
                        </h2>
                    </div>

                    <div className="invite-toolbar">
                        <label className="invite-toggle">
                            <input
                                type="checkbox"
                                checked={showAllInvites}
                                onChange={(event) => setShowAllInvites(event.target.checked)}
                            />
                            <span>Показать все приглашения</span>
                        </label>

                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => void loadInvites()}
                            disabled={isLoading}
                        >
                            {isLoading ? "Обновляем..." : "Обновить"}
                        </button>
                    </div>
                </div>

                {errorMessage && <div className="error-box">{errorMessage}</div>}
                {isLoading && <p>Загрузка...</p>}

                {!isLoading && invites.length === 0 && (
                    <div className="invites-empty">
                        <div className="invites-empty-title">Приглашений пока нет</div>
                        <div className="invites-empty-text">
                            {showAllInvites
                                ? "У тренера пока нет приглашений."
                                : "Новых приглашений сейчас нет."}
                        </div>
                    </div>
                )}

                {!isLoading && invites.length > 0 && (
                    <div className="invites-list">
                        {invites.map((invite) => {
                            const isDeleting = deletingInviteId === invite.id;

                            return (
                                <article key={invite.id} className="invite-card-ui">
                                    <div className="invite-card-top">
                                        <div>
                                            <div className="invite-card-kicker">Invite #{invite.id}</div>
                                            <h3 className="invite-card-title">
                                                {invite.email ?? "Без привязки к email"}
                                            </h3>
                                            <div className="invite-card-subtitle">
                                                Истекает: {new Date(invite.expiresAt).toLocaleString()}
                                            </div>
                                        </div>

                                        <span className={getInviteStatusClass(invite.status)}>
                      {getInviteStatusLabel(invite.status)}
                    </span>
                                    </div>

                                    <div className="invite-card-grid">
                                        <div className="invite-card-item">
                                            <span>Email</span>
                                            <strong>{invite.email ?? "—"}</strong>
                                        </div>

                                        <div className="invite-card-item">
                                            <span>Статус</span>
                                            <strong>{getInviteStatusLabel(invite.status)}</strong>
                                        </div>

                                        <div className="invite-card-item">
                                            <span>Использовано</span>
                                            <strong>
                                                {invite.usedAt ? new Date(invite.usedAt).toLocaleString() : "Ещё нет"}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="invite-link-panel">
                                        <div className="invite-link-label">Ссылка регистрации</div>
                                        <input
                                            className="invite-link-input"
                                            type="text"
                                            readOnly
                                            value={invite.registrationLink}
                                        />
                                    </div>

                                    <div className="invite-card-actions">
                                        <button
                                            type="button"
                                            className="dashboard-btn dashboard-btn-primary"
                                            onClick={() => void handleCopy(invite)}
                                        >
                                            {copiedInviteId === invite.id ? "Скопировано" : "Копировать ссылку"}
                                        </button>

                                        <button
                                            type="button"
                                            className="dashboard-btn dashboard-btn-secondary"
                                            onClick={() => void handleDelete(invite.id)}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Удаляем..." : "Удалить"}
                                        </button>
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