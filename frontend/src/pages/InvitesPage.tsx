import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import styles from "./BookingPages.module.css";
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
            return `${styles.badge} ${styles.inviteBadgeActive}`;
        case "USED":
            return `${styles.badge} ${styles.inviteBadgeUsed}`;
        case "EXPIRED":
            return `${styles.badge} ${styles.inviteBadgeExpired}`;
        case "CANCELLED":
            return `${styles.badge} ${styles.inviteBadgeCancelled}`;
        default:
            return styles.badge;
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
    const [successMessage, setSuccessMessage] = useState("");
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
        setSuccessMessage("");

        const trimmedEmail = email.trim();
        const trimmedExpiresInDays = expiresInDays.trim();

        if (!trimmedEmail) {
            setErrorMessage("Поле «Email клиента» обязательно");
            return;
        }

        if (!trimmedExpiresInDays) {
            setErrorMessage("Поле «Срок, дней» обязательно");
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
            setSuccessMessage("Приглашение создано");
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
            setSuccessMessage("Ссылка скопирована");

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
        setSuccessMessage("");

        try {
            await trainerApi.deleteInvite(inviteId);
            setInvites((prev) => prev.filter((item) => item.id !== inviteId));
            setSuccessMessage("Приглашение удалено");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось удалить приглашение"));
        } finally {
            setDeletingInviteId(null);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Приглашения</h1>
                <p className={styles.subtitle}>
                    Создавай ссылки регистрации для клиентов и управляй уже созданными приглашениями.
                </p>
            </div>

            <section className={styles.card}>
                <div className={styles.requestHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>Сводка</h2>
                        <p className={styles.subtitle}>
                            Быстрый обзор текущих приглашений.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.buttonSecondary}
                        onClick={() => void loadInvites()}
                        disabled={isLoading}
                    >
                        {isLoading ? "Обновляем..." : "Обновить"}
                    </button>
                </div>

                <div className={styles.inviteStatsGrid}>
                    <div className={styles.inviteStatCard}>
                        <div className={styles.inviteStatLabel}>Всего</div>
                        <div className={styles.inviteStatValue}>{stats.total}</div>
                    </div>

                    <div className={styles.inviteStatCard}>
                        <div className={styles.inviteStatLabel}>Активные</div>
                        <div className={styles.inviteStatValue}>{stats.active}</div>
                    </div>

                    <div className={styles.inviteStatCard}>
                        <div className={styles.inviteStatLabel}>Использованы</div>
                        <div className={styles.inviteStatValue}>{stats.used}</div>
                    </div>

                    <div className={styles.inviteStatCard}>
                        <div className={styles.inviteStatLabel}>Архив</div>
                        <div className={styles.inviteStatValue}>
                            {stats.expired + stats.cancelled}
                        </div>
                    </div>
                </div>
            </section>

            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>Новое приглашение</h2>

                <form className={styles.inviteCreateForm} onSubmit={handleCreateInvite}>
                    <div className={styles.fieldWide}>
                        <label className={styles.label} htmlFor="invite-email">
                            Email клиента
                        </label>
                        <input
                            id="invite-email"
                            className={styles.input}
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="client@test.local"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="invite-expire-days">
                            Срок, дней
                        </label>
                        <input
                            id="invite-expire-days"
                            className={styles.input}
                            type="number"
                            min={1}
                            step={1}
                            inputMode="numeric"
                            value={expiresInDays}
                            onChange={(event) => setExpiresInDays(event.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inviteCreateAction}>
                        <button
                            type="submit"
                            className={styles.button}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Создаём..." : "Создать"}
                        </button>
                    </div>
                </form>
            </section>

            <section className={styles.card}>
                <div className={styles.requestHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>Список приглашений</h2>
                        <p className={styles.subtitle}>
                            Можно копировать ссылку, смотреть статус и удалять неактуальные записи.
                        </p>
                    </div>
                </div>

                <label className={styles.inviteCheckboxRow}>
                    <input
                        type="checkbox"
                        checked={showAll}
                        onChange={(event) => setShowAll(event.target.checked)}
                    />
                    <span>Показывать все</span>
                </label>

                {isLoading ? (
                    <div className={styles.empty}>Загрузка...</div>
                ) : invites.length === 0 ? (
                    <div className={styles.emptyBlock}>
                        <h3 className={styles.emptyTitle}>Приглашений нет</h3>
                        <p className={styles.subtitle}>
                            Создай первое приглашение для нового клиента.
                        </p>
                    </div>
                ) : (
                    <div className={styles.requestsList}>
                        {invites.map((invite) => {
                            const isDeleting = deletingInviteId === invite.id;
                            const isCopied = copiedInviteId === invite.id;

                            return (
                                <article key={invite.id} className={styles.requestCard}>
                                    <div className={styles.requestHeader}>
                                        <div>
                                            <strong>{invite.email ?? "Без привязки к email"}</strong>
                                            <div className={styles.inviteMeta}>
                                                <div>ID {invite.id}</div>
                                                {invite.clientId != null && <div>Клиент ID {invite.clientId}</div>}
                                                <div>Истекает {formatDateTime(invite.expiresAt)}</div>
                                                <div>Использовано {formatDateTime(invite.usedAt)}</div>
                                            </div>
                                        </div>

                                        <div className={getInviteStatusClass(invite.status)}>
                                            {getInviteStatusLabel(invite.status)}
                                        </div>
                                    </div>

                                    <div className={styles.inviteLinkBlock}>
                                        <div className={styles.inviteLinkLabel}>Ссылка для регистрации</div>
                                        <div className={styles.inviteLinkValue}>
                                            {invite.registrationLink}
                                        </div>
                                    </div>

                                    <div className={styles.inlineActions}>
                                        <button
                                            type="button"
                                            className={styles.buttonSecondary}
                                            onClick={() => void handleCopy(invite)}
                                        >
                                            {isCopied ? "Скопировано" : "Копировать"}
                                        </button>

                                        <button
                                            type="button"
                                            className={styles.buttonDanger}
                                            onClick={() => void handleDelete(invite.id)}
                                            disabled={isDeleting}
                                            title="Удалить"
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