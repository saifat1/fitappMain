import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Avatar from "../shared/ui/Avatar";
import FbTextField from "../shared/ui/FbTextField";
import ClientContractsSection from "../features/contract/ui/ClientContractsSection";
import { trainerApi } from "../shared/api/trainerApi";
import { trainingApi } from "../shared/api/trainingApi";
import {
    clientName,
    clientInitials,
    clientColor,
    clientStatusPill,
} from "../features/trainer/lib/clientDisplay";
import { formatDateKey } from "../features/calendar/lib/trainerCalendar";
import { formatDaySubtitle } from "../features/calendar/lib/calendarWeek";
import type { TrainerClientResponse } from "../features/trainer/model/trainer.types";
import type { TrainingResponse } from "../features/training/model/training.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ClientDetailsPage() {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();
    const id = Number(clientId);

    const [client, setClient] = useState<TrainerClientResponse | null>(null);
    const [upcoming, setUpcoming] = useState<TrainingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [menuOpen, setMenuOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await trainerApi.getClient(id);
            setClient(data);
            setFirstName(data.firstName ?? "");
            setLastName(data.lastName ?? "");

            if (data.claimedByClient) {
                const today = new Date();
                const until = new Date();
                until.setDate(today.getDate() + 60);
                const trainings: TrainingResponse[] = await trainingApi.getTrainings(formatDateKey(today), formatDateKey(until));
                setUpcoming(
                    trainings
                        .filter((t) => t.clientId === id && t.status === "PLANNED")
                        .sort((a, b) => `${a.trainingDate}${a.startTime}`.localeCompare(`${b.trainingDate}${b.startTime}`))
                );
            }
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить клиента"));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    const pill = useMemo(() => (client ? clientStatusPill(client) : null), [client]);

    const handleShare = async () => {
        try {
            const invite = await trainerApi.createInviteForClient(id);
            if (navigator.share) {
                await navigator.share({ title: "Приглашение", url: invite.registrationLink });
            } else {
                await navigator.clipboard.writeText(invite.registrationLink);
                window.alert("Ссылка-приглашение скопирована");
            }
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось создать приглашение"));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErrorMessage("");
        try {
            const updated = await trainerApi.updateClient(id, {
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
            });
            setClient(updated);
            setEditing(false);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось сохранить"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        setMenuOpen(false);
        if (!window.confirm("Удалить клиента?")) return;
        (async () => {
            try {
                await trainerApi.deactivateClient(id);
                navigate("/trainer/clients");
            } catch (error) {
                setErrorMessage(resolveApiError(error, "Не удалось удалить клиента"));
            }
        })();
    };

    if (isLoading) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
                    <h1 className="fb-topbar__title">Клиент</h1>
                </header>
                <div className="fb-cal-status">Загрузка…</div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
                    <h1 className="fb-topbar__title">Клиент</h1>
                </header>
                <div className="fb-cal-error">{errorMessage || "Клиент не найден"}</div>
            </div>
        );
    }

    const isActive = client.claimedByClient;

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => (editing ? setEditing(false) : navigate(-1))}>‹</button>
                <h1 className="fb-topbar__title">Клиент</h1>
                {!editing && (
                    <button type="button" className="fb-topbar__action" aria-label="Меню" onClick={() => setMenuOpen((v) => !v)}>⋮</button>
                )}
                {menuOpen && (
                    <>
                        <button type="button" className="fb-overlay" aria-label="Закрыть" onClick={() => setMenuOpen(false)} />
                        <div className="fb-menu" role="menu">
                            <button type="button" className="fb-menu__item" onClick={() => { setMenuOpen(false); setEditing(true); }}>
                                Редактировать
                            </button>
                            <button type="button" className="fb-menu__item fb-menu__item--danger" onClick={handleDelete}>
                                Удалить
                            </button>
                        </div>
                    </>
                )}
            </header>

            <div className="fb-body">
                {editing ? (
                    <>
                        <div className="fb-readonly">
                            <span className="fb-readonly__label">Электронная почта</span>
                            <span className="fb-readonly__value">{client.email}</span>
                        </div>
                        <FbTextField id="cl-first" label="Имя" value={firstName} onChange={setFirstName} />
                        <FbTextField id="cl-last" label="Фамилия" value={lastName} onChange={setLastName} />

                        {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                        <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Сохраняем…" : "Сохранить"}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="fb-client-hero">
                            <Avatar initials={clientInitials(client)} color={clientColor(client)} size="lg" />
                            <div className="fb-client-hero__name">{clientName(client)}</div>
                            <div className="fb-client-hero__email">{client.email}</div>
                            {pill && <span className={`fb-pill ${pill.cls}`}>{pill.label}</span>}
                            {client.hasContracts && (
                                <span className={`fb-pill ${client.contractExhausted ? "fb-pill--danger" : "fb-pill--ok"}`}>
                                    Осталось тренировок: {client.totalRemainingTrainings}
                                </span>
                            )}
                        </div>

                        {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                        <ClientContractsSection clientId={id} onBalanceChange={load} />

                        <div className="fb-list" style={{ marginTop: 12 }}>
                            <button
                                type="button"
                                className="fb-row fb-row--button"
                                onClick={() => navigate(`/trainer/clients/${id}/questionnaire`)}
                            >
                                <span className="fb-row__main"><span className="fb-row__title">Анкета</span></span>
                                <span className="fb-row__chevron">›</span>
                            </button>
                            <button
                                type="button"
                                className="fb-row fb-row--button"
                                onClick={() => navigate(`/trainer/clients/${id}/measurements`)}
                            >
                                <span className="fb-row__main"><span className="fb-row__title">Измерения</span></span>
                                <span className="fb-row__chevron">›</span>
                            </button>
                        </div>

                        {isActive ? (
                            <>
                                <button
                                    type="button"
                                    className="fb-btn fb-btn--ghost"
                                    onClick={() => navigate("/trainings/new", { state: { clientId: id } })}
                                >
                                    + Новая тренировка
                                </button>

                                <div className="fb-section-title fb-section-title--flush">Предстоящие тренировки</div>
                                {upcoming.length === 0 ? (
                                    <div className="fb-empty">Запланированных тренировок нет</div>
                                ) : (
                                    <div className="fb-list">
                                        {upcoming.slice(0, 3).map((t) => (
                                            <button key={t.id} type="button" className="fb-row fb-row--button" onClick={() => navigate(`/trainings/${t.id}`)}>
                                                <span className="fb-row__main">
                                                    <span className="fb-row__title">Тренировка</span>
                                                    <span className="fb-row__sub">
                                                        {formatDaySubtitle(t.trainingDate)}, {t.startTime?.slice(0, 5)}
                                                    </span>
                                                </span>
                                                <span className="fb-row__chevron">›</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {upcoming.length > 3 && (
                                    <button type="button" className="fb-add-link" onClick={() => navigate("/trainings")}>
                                        Смотреть все
                                    </button>
                                )}

                                <div className="fb-list" style={{ marginTop: 12 }}>
                                    <button type="button" className="fb-row fb-row--button" onClick={() => navigate("/trainings")}>
                                        <span className="fb-row__main"><span className="fb-row__title">Архив тренировок</span></span>
                                        <span className="fb-row__chevron">›</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={handleShare}>
                                Поделиться приглашением
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
