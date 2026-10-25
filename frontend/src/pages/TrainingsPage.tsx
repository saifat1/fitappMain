import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import UpcomingTrainingRow from "../features/training/ui/UpcomingTrainingRow";
import { useAuth } from "../features/auth/model/AuthContext";
import { trainingApi } from "../shared/api/trainingApi";
import { trainerApi } from "../shared/api/trainerApi";
import { clientName } from "../features/trainer/lib/clientDisplay";
import { getClientDisplayName } from "../features/calendar/lib/trainerCalendar";
import { addDaysKey, groupByMonth, todayKey } from "../features/training/lib/trainingDates";

import type { TrainingResponse } from "../features/training/model/training.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

/** How far back/ahead the list looks. One request; enough for a client's archive. */
const PAST_DAYS = 365;
const FUTURE_DAYS = 180;

type Period = "upcoming" | "past";
type TypeFilter = "ALL" | "PERSONAL" | "INDEPENDENT" | "CIRCUIT";

const TYPE_FILTERS: { code: TypeFilter; label: string }[] = [
    { code: "ALL", label: "Все" },
    { code: "PERSONAL", label: "Персональные" },
    { code: "INDEPENDENT", label: "Самостоятельные" },
    { code: "CIRCUIT", label: "Круговые" },
];

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function compareAsc(a: TrainingResponse, b: TrainingResponse): number {
    return `${a.trainingDate} ${a.startTime ?? ""}`.localeCompare(`${b.trainingDate} ${b.startTime ?? ""}`);
}

function shortName(fullName: string): string {
    const [first, last] = fullName.split(" ");
    return last ? `${first} ${last[0]}.` : first;
}

export default function TrainingsPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();

    const isTrainer = currentUser?.role === "TRAINER";
    const clientIdParam = Number(searchParams.get("clientId"));
    const clientId = isTrainer && Number.isFinite(clientIdParam) && clientIdParam > 0 ? clientIdParam : null;

    const [trainings, setTrainings] = useState<TrainingResponse[]>([]);
    const [clientTitle, setClientTitle] = useState("");
    const [period, setPeriod] = useState<Period>(searchParams.get("period") === "past" ? "past" : "upcoming");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");
        const today = todayKey();
        try {
            const data: TrainingResponse[] = await trainingApi.getTrainings(
                addDaysKey(today, -PAST_DAYS),
                addDaysKey(today, FUTURE_DAYS),
                // FIT-77: a client's archive also shows the trainings the client wrote down themselves
                clientId != null
            );
            setTrainings(clientId ? data.filter((t) => t.clientId === clientId) : data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить тренировки"));
        } finally {
            setIsLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (!clientId) {
            setClientTitle("");
            return;
        }
        trainerApi
            .getClient(clientId)
            .then((client) => setClientTitle(shortName(clientName(client))))
            .catch(() => setClientTitle(""));
    }, [clientId]);

    // FIT-77: not yet completed trainings the client wrote down themselves — the number on «Самостоятельные»,
    // and in that filter they're listed on top whatever the tab (the archive opens on «Прошедшие»).
    const clientOwnPlannedList = useMemo(
        () => [...trainings.filter((t) => t.createdByClient && t.status === "PLANNED")].sort(compareAsc),
        [trainings]
    );
    const clientOwnPlanned = clientOwnPlannedList.length;
    const showClientOwnBlock = clientId != null && typeFilter === "INDEPENDENT" && clientOwnPlanned > 0;

    const stats = useMemo(
        () => ({
            completed: trainings.filter((t) => t.status === "COMPLETED").length,
            planned: trainings.filter((t) => t.status === "PLANNED").length,
            cancelled: trainings.filter((t) => t.status === "CANCELLED").length,
        }),
        [trainings]
    );

    const groups = useMemo(() => {
        const today = todayKey();
        const byPeriod = trainings.filter((t) =>
            period === "upcoming" ? t.trainingDate >= today : t.trainingDate < today
        );
        const byType = byPeriod.filter(
            (t) =>
                (typeFilter === "ALL" || t.trainingType === typeFilter) &&
                // shown in their own block above
                !(clientId != null && typeFilter === "INDEPENDENT" && t.createdByClient && t.status === "PLANNED")
        );
        const sorted = [...byType].sort(compareAsc);
        if (period === "past") sorted.reverse();
        return groupByMonth(sorted, (t) => t.trainingDate);
    }, [trainings, period, typeFilter, clientId]);

    // In the trainer's unfiltered list each row needs the client's name.
    const rowTitle = (t: TrainingResponse): string | undefined =>
        isTrainer && !clientId ? getClientDisplayName(t) : undefined;

    const content: ReactNode = (
        <div className="fb-tab-panel">
            {clientId && (
                <div className="fb-stat-grid">
                    <div className="fb-stat-tile">
                        <div className="fb-stat-tile__value">{stats.completed}</div>
                        <div className="fb-stat-tile__label">Проведено</div>
                    </div>
                    <div className="fb-stat-tile">
                        <div className="fb-stat-tile__value">{stats.planned}</div>
                        <div className="fb-stat-tile__label">В плане</div>
                    </div>
                    <div className="fb-stat-tile">
                        <div className="fb-stat-tile__value">{stats.cancelled}</div>
                        <div className="fb-stat-tile__label">Отменено</div>
                    </div>
                </div>
            )}

            <div className="fb-segment" style={clientId ? { marginTop: 16 } : undefined}>
                <button
                    type="button"
                    className={`fb-segment__item ${period === "upcoming" ? "fb-segment__item--active" : ""}`}
                    onClick={() => setPeriod("upcoming")}
                >
                    Предстоящие
                </button>
                <button
                    type="button"
                    className={`fb-segment__item ${period === "past" ? "fb-segment__item--active" : ""}`}
                    onClick={() => setPeriod("past")}
                >
                    Прошедшие
                </button>
            </div>

            <div className="fb-chips" style={{ marginTop: 12 }}>
                {TYPE_FILTERS.map((f) => (
                    <button
                        key={f.code}
                        type="button"
                        className={`fb-chip ${typeFilter === f.code ? "fb-chip--active" : ""}`}
                        onClick={() => setTypeFilter(f.code)}
                    >
                        {f.label}
                        {f.code === "INDEPENDENT" && clientOwnPlanned > 0 ? (
                            <span className="fb-chip__badge" aria-label={`Записал клиент, не проведено: ${clientOwnPlanned}`}>
                                {clientOwnPlanned}
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>

            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            {!isLoading && showClientOwnBlock ? (
                <div>
                    <div className="fb-section-title">Записал клиент · не проведены</div>
                    <div className="fb-list">
                        {clientOwnPlannedList.map((t) => (
                            <UpcomingTrainingRow key={t.id} training={t} onClick={() => navigate(`/trainings/${t.id}`)} />
                        ))}
                    </div>
                </div>
            ) : null}

            {isLoading ? (
                <div className="fb-cal-status">Загрузка…</div>
            ) : groups.length === 0 && showClientOwnBlock ? null : groups.length === 0 ? (
                <div className="fb-empty" style={{ marginTop: 16 }}>
                    {period === "upcoming" ? "Запланированных тренировок нет" : "Прошедших тренировок нет"}
                </div>
            ) : (
                groups.map((group) => (
                    <div key={group.title}>
                        <div className="fb-section-title">{group.title}</div>
                        <div className="fb-list">
                            {group.items.map((t) => (
                                <UpcomingTrainingRow
                                    key={t.id}
                                    training={t}
                                    title={rowTitle(t)}
                                    onClick={() => navigate(`/trainings/${t.id}`)}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    if (!isTrainer) {
        return <MobileShell title="Тренировки">{content}</MobileShell>;
    }

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">{clientTitle ? `Тренировки · ${clientTitle}` : "Тренировки"}</h1>
            </header>

            {content}

            <button
                type="button"
                className="fb-fab fb-fab--flush"
                aria-label="Новая тренировка"
                onClick={() => navigate("/trainings/new", clientId ? { state: { clientId } } : undefined)}
            >
                +
            </button>
        </div>
    );
}
