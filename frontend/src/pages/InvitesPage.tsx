import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
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
        case "ACTIVE":
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
        case "ACTIVE":
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

    return new Date(value).toLocaleString();
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
        const active = invites.filter((item) => item.status === "ACTIVE").length;
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

    const handleCreateInvite = async (event: FormEvent<HTMLFormElement>) => {
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

            if (!showAll || created.status === "ACTIVE") {
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
        <div className="invites-page invites-page-compact entity-page-compact">
            <section className="invites-header-bar entity-header-bar">
                <div className="invites-header-main entity-header-main">
                    <h1 className="invites-header-title entity-header-title">Приглашения</h1>

                    <div className="invites-summary-row entity-summary-row">
            <span className="invites-summary-chip entity-summary-chip">
              <strong>{stats.total}</strong>
              <span>Всего</span>
            </span>

                        <span className="invites-summary-chip active entity-summary-chip entity-summary-chip--positive">
              <strong>{stats.active}</strong>
              <span>Активные</span>
            </span>

                        <span className="invites-summary-chip used entity-summary-chip entity-summary-chip--info">
              <strong>{stats.used}</strong>
              <span>Использованы</span>
            </span>

                        <span className="invites-summary-chip muted entity-summary-chip entity-summary-chip--muted">
              <strong>{stats.expired + stats.cancelled}</strong>
              <span>Архив</span>
            </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary invites-refresh-btn entity-header-action"
                    onClick={() => void loadInvites()}
                    disabled={isLoading}
                >
                    {isLoading ? "Обновляем..." : "Обновить"}
                </button>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <section className="invites-panel invites-panel-compact entity-panel-compact">
                <div className="invites-section-head entity-section-head">
                    <h2 className="invites-section-title entity-section-title">Новое приглашение</h2>
                </div>

                <form
                    className="invites-create-inline entity-inline-form entity-inline-form--3"
                    onSubmit={handleCreateInvite}
                >
                    <div className="form-row">
                        <label htmlFor="invite-email">Email клиента</label>
                        <input
                            id="invite-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="client@test.local"
                            required
                        />
                    </div>

                    <div className="form-row invites-days-field">
                        <label htmlFor="invite-expiry">Срок, дней</label>
                        <input
                            id="invite-expiry"
                            type="number"
                            min="1"
                            step="1"
                            value={expiresInDays}
                            onChange={(event) => setExpiresInDays(event.target.value)}
                            required
                        />
                    </div>

                    <div className="invites-create-actions">
                        <button
                            type="submit"
                            className="dashboard-btn dashboard-btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Создаём..." : "Создать"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="invites-panel invites-panel-compact entity-panel-compact">
                <div className="invites-section-head invites-section-head-with-controls entity-section-head entity-section-head--wrap">
                    <div>
                        <h2 className="invites-section-title entity-section-title">Список приглашений</h2>
                    </div>

                    <label className="invite-toggle invite-toggle-compact">
                        <input
                            type="checkbox"
                            checked={showAll}
                            onChange={(event) => setShowAll(event.target.checked)}
                        />
                        <span>Показывать все</span>
                    </label>
                </div>

                {isLoading ? (
                    <div className="invites-empty-text">Загрузка...</div>
                ) : invites.length === 0 ? (
                    <div className="invites-empty">
                        <div className="invites-empty-title">Приглашений нет</div>
                        <div className="invites-empty-text">
                            Создай первое приглашение для нового клиента.
                        </div>
                    </div>
                ) : (
                    <section className="invites-list invites-list-compact entity-list-compact">
                        {invites.map((invite) => {
                            const isDeleting = deletingInviteId === invite.id;
                            const isCopied = copiedInviteId === invite.id;

                            return (
                                <article
                                    key={invite.id}
                                    className="invite-card-ui invite-card-ui-compact entity-card-compact"
                                >
                                    <div className="invite-card-row entity-card-row">
                                        <div className="invite-card-main-compact entity-card-main">
                                            <div className="invite-card-title-row entity-title-row">
                                                <div className="invite-card-title-compact entity-title">
                                                    {invite.email ?? "Без привязки к email"}
                                                </div>
                                                <div className={getInviteStatusClass(invite.status)}>
                                                    {getInviteStatusLabel(invite.status)}
                                                </div>
                                            </div>

                                            <div className="invite-card-meta-row entity-meta-row">
                                                <span>ID {invite.id}</span>
                                                <span>Истекает {formatDateTime(invite.expiresAt)}</span>
                                                <span>Использовано {formatDateTime(invite.usedAt)}</span>
                                            </div>

                                            <div className="invite-link-inline">
                                                <input
                                                    className="invite-link-inline-input"
                                                    value={invite.registrationLink}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        <div className="invite-card-actions invite-card-actions-compact entity-actions-compact">
                                            <button
                                                type="button"
                                                className="dashboard-btn dashboard-btn-secondary invite-action-btn entity-secondary-btn"
                                                onClick={() => void handleCopy(invite)}
                                            >
                                                {isCopied ? "Скопировано" : "Копировать"}
                                            </button>

                                            <button
                                                type="button"
                                                className="card-action-btn card-action-btn-danger invite-icon-action entity-icon-btn"
                                                onClick={() => void handleDelete(invite.id)}
                                                disabled={isDeleting}
                                                title="Удалить"
                                            >
                                                {isDeleting ? "..." : "×"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </section>
        </div>
    );
}