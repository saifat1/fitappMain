import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MobileShell from "../widgets/MobileShell";
import FbTextField from "../shared/ui/FbTextField";
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
            return "fb-pill fb-pill--invite";
        case "USED":
            return "fb-pill fb-pill--ok";
        default:
            return "fb-pill fb-pill--muted";
    }
}

function formatDateTime(value: string | null): string {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Trainer: registration links by email (FIT-67 — new design, reached from «Клиенты»). */
export default function InvitesPage() {
    const navigate = useNavigate();
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
        const confirmed = window.confirm("Удалить приглашение? Ссылка перестанет работать.");
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

    const back = (
        <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
    );

    return (
        <MobileShell title="Приглашения" left={back} showTabBar={false}>
            <div className="fb-tab-panel fb-invites">
                <p className="fb-hint">
                    Ссылка для регистрации клиента по email. Клиент сам заполнит профиль и появится в вашем списке.
                </p>

                <form className="fb-invites__form" onSubmit={handleCreateInvite}>
                    <FbTextField
                        id="invite-email"
                        label="Email клиента"
                        type="email"
                        autoComplete="off"
                        value={email}
                        onChange={setEmail}
                    />
                    <FbTextField
                        id="invite-expire-days"
                        label="Срок действия, дней"
                        type="number"
                        inputMode="numeric"
                        value={expiresInDays}
                        onChange={setExpiresInDays}
                    />
                    <button type="submit" className="fb-btn fb-btn--primary fb-form-submit" disabled={isSubmitting}>
                        {isSubmitting ? "Создаём…" : "Создать приглашение"}
                    </button>
                </form>

                {errorMessage && <div className="fb-cal-error">{errorMessage}</div>}
                {successMessage && <div className="fb-success-note">{successMessage}</div>}

                <div className="fb-segment fb-invites__segment">
                    <button
                        type="button"
                        className={`fb-segment__item ${!showAll ? "fb-segment__item--active" : ""}`}
                        onClick={() => setShowAll(false)}
                    >
                        Активные
                    </button>
                    <button
                        type="button"
                        className={`fb-segment__item ${showAll ? "fb-segment__item--active" : ""}`}
                        onClick={() => setShowAll(true)}
                    >
                        Все
                    </button>
                </div>

                {isLoading ? (
                    <div className="fb-empty">Загрузка…</div>
                ) : invites.length === 0 ? (
                    <div className="fb-empty">{showAll ? "Приглашений нет" : "Активных приглашений нет"}</div>
                ) : (
                    <div className="fb-invites__list">
                        {invites.map((invite) => {
                            const isDeleting = deletingInviteId === invite.id;
                            const isCopied = copiedInviteId === invite.id;

                            return (
                                <div key={invite.id} className="fb-breq__card">
                                    <div className="fb-breq__head">
                                        <div className="fb-breq__main">
                                            <div className="fb-breq__client">{invite.email ?? "Без email"}</div>
                                            <div className="fb-breq__when">
                                                {invite.usedAt
                                                    ? `Использовано ${formatDateTime(invite.usedAt)}`
                                                    : `Действует до ${formatDateTime(invite.expiresAt)}`}
                                            </div>
                                        </div>
                                        <span className={getInviteStatusClass(invite.status)}>
                                            {getInviteStatusLabel(invite.status)}
                                        </span>
                                    </div>

                                    {invite.status === "NEW" && (
                                        <div className="fb-linkbox">
                                            <span className="fb-linkbox__url">{invite.registrationLink}</span>
                                            <button
                                                type="button"
                                                className="fb-linkbox__copy"
                                                onClick={() => void handleCopy(invite)}
                                                aria-label="Скопировать"
                                            >
                                                {isCopied ? "✓" : "⧉"}
                                            </button>
                                        </div>
                                    )}

                                    <div className="fb-breq__actions">
                                        {invite.clientId != null && (
                                            <button
                                                type="button"
                                                className="fb-btn fb-btn--ghost fb-invites__btn"
                                                onClick={() => navigate(`/trainer/clients/${invite.clientId}`)}
                                            >
                                                Клиент
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="fb-btn fb-btn--ghost fb-invites__btn fb-btn--danger-text"
                                            onClick={() => void handleDelete(invite.id)}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Удаляем…" : "Удалить"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MobileShell>
    );
}
