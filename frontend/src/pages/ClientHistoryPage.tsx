import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import { clientHistoryApi } from "../shared/api/clientHistoryApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    ClientHistoryFiltersState,
    ClientHistoryPeriod,
    ClientHistoryResponse,
    ClientHistoryStatusFilter,
} from "../features/client-history/model/clientHistory.types";
import {
    formatClientDisplayName,
    formatTrainingDateLabel,
    formatTrainingStatus,
    formatTrainingTimeRange,
} from "../features/client-history/lib/clientHistoryFormat";
import { buildClientHistoryStats, filterClientHistoryTrainings } from "../features/client-history/lib/clientHistoryFilters";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

const PERIODS: { value: ClientHistoryPeriod; label: string }[] = [
    { value: "7d", label: "7 дней" },
    { value: "30d", label: "30 дней" },
    { value: "90d", label: "90 дней" },
    { value: "all", label: "Всё время" },
];

const STATUSES: { value: ClientHistoryStatusFilter; label: string }[] = [
    { value: "ALL", label: "Все" },
    { value: "COMPLETED", label: "Завершённые" },
    { value: "PLANNED", label: "Запланированные" },
    { value: "CANCELLED", label: "Отменённые" },
];

const STATUS_CLASS: Record<string, string> = {
    PLANNED: "fb-status-badge--planned",
    COMPLETED: "fb-status-badge--completed",
    CANCELLED: "fb-status-badge--cancelled",
};

/** Trainer: all trainings of one client with exercises (FIT-67 — new design, reached from the client card). */
export default function ClientHistoryPage() {
    const { clientId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState<ClientHistoryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [filters, setFilters] = useState<ClientHistoryFiltersState>({
        period: "30d",
        status: "ALL",
        query: "",
        showOnlyWithNotes: false,
    });
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    useEffect(() => {
        if (!clientId) return;
        clientHistoryApi
            .getClientHistory(Number(clientId))
            .then(setData)
            .catch((error) => setErrorMessage(resolveApiError(error, "Не удалось загрузить историю клиента")))
            .finally(() => setIsLoading(false));
    }, [clientId]);

    const trainings = useMemo(() => filterClientHistoryTrainings(data?.trainings ?? [], filters), [data, filters]);
    const stats = useMemo(() => buildClientHistoryStats(trainings), [trainings]);

    const toggle = (id: number) =>
        setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const back = (
        <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
    );

    return (
        <MobileShell title={data ? formatClientDisplayName(data.client) : "История клиента"} left={back} showTabBar={false}>
            <div className="fb-tab-panel fb-history">
                {errorMessage && <div className="fb-cal-error">{errorMessage}</div>}

                {isLoading ? (
                    <div className="fb-empty">Загрузка…</div>
                ) : !data ? (
                    <div className="fb-empty">История клиента не найдена</div>
                ) : (
                    <>
                        <div className="fb-section-title fb-section-title--flush">История тренировок</div>

                        <div className="fb-stat-grid">
                            <div className="fb-stat-tile">
                                <div className="fb-stat-tile__label">Всего</div>
                                <div className="fb-stat-tile__value">{stats.total}</div>
                            </div>
                            <div className="fb-stat-tile">
                                <div className="fb-stat-tile__label">Завершено</div>
                                <div className="fb-stat-tile__value">{stats.completed}</div>
                            </div>
                            <div className="fb-stat-tile">
                                <div className="fb-stat-tile__label">Упражнений выполнено</div>
                                <div className="fb-stat-tile__value">{stats.completionRate}%</div>
                            </div>
                        </div>

                        <div className="fb-chips fb-chips--wrap">
                            {PERIODS.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    className={`fb-chip ${filters.period === p.value ? "fb-chip--active" : ""}`}
                                    onClick={() => setFilters((f) => ({ ...f, period: p.value }))}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="fb-chips fb-chips--wrap">
                            {STATUSES.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    className={`fb-chip ${filters.status === s.value ? "fb-chip--active" : ""}`}
                                    onClick={() => setFilters((f) => ({ ...f, status: s.value }))}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="fb-search fb-history__search">
                            <input
                                type="search"
                                placeholder="Поиск по упражнениям и заметкам"
                                aria-label="Поиск по истории"
                                value={filters.query}
                                onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                            />
                        </div>
                        <label className="fb-history__notes">
                            <input
                                type="checkbox"
                                className="fb-switch"
                                checked={filters.showOnlyWithNotes}
                                onChange={(e) => setFilters((f) => ({ ...f, showOnlyWithNotes: e.target.checked }))}
                            />
                            <span>Только с заметками</span>
                        </label>

                        {trainings.length === 0 ? (
                            <div className="fb-empty">За выбранный период тренировок нет</div>
                        ) : (
                            <div className="fb-list">
                                {trainings.map((t) => {
                                    const open = expandedIds.includes(t.id);
                                    return (
                                        <div key={t.id} className="fb-history__item">
                                            <button type="button" className="fb-row fb-row--button" onClick={() => toggle(t.id)}>
                                                <span className="fb-row__main">
                                                    <span className="fb-row__title">{formatTrainingDateLabel(t.trainingDate)}</span>
                                                    <span className="fb-row__sub">
                                                        {formatTrainingTimeRange(t.startTime, t.endTime)} · упражнений: {t.exercises.length}
                                                    </span>
                                                </span>
                                                <span className={`fb-status-badge ${STATUS_CLASS[t.status] ?? ""}`}>{formatTrainingStatus(t.status)}</span>
                                                <span className="fb-row__chevron">{open ? "⌄" : "›"}</span>
                                            </button>

                                            {open && (
                                                <div className="fb-history__details">
                                                    {t.trainerNote && <div className="fb-history__note">Тренер: {t.trainerNote}</div>}
                                                    {t.clientNote && <div className="fb-history__note">Клиент: {t.clientNote}</div>}
                                                    {t.exercises.length === 0 ? (
                                                        <div className="fb-hint">Упражнений нет</div>
                                                    ) : (
                                                        t.exercises.map((ex) => (
                                                            <div key={ex.id} className="fb-history__ex">
                                                                <span className={`fb-history__ex-mark ${ex.isCompleted ? "fb-history__ex-mark--done" : ""}`}>
                                                                    {ex.isCompleted ? "✓" : ""}
                                                                </span>
                                                                <span className="fb-history__ex-main">
                                                                    <span className="fb-history__ex-title">{ex.title}</span>
                                                                    <span className="fb-row__sub">
                                                                        {[
                                                                            ex.sets ? `${ex.sets} подх.` : null,
                                                                            ex.repsMode !== "NONE" ? `${ex.repsDisplay} повт.` : null,
                                                                            ex.weight != null ? `${String(ex.weight).replace(".", ",")} кг` : null,
                                                                            ex.durationSeconds ? `${ex.durationSeconds} сек` : null,
                                                                        ]
                                                                            .filter(Boolean)
                                                                            .join(" · ") || "Без параметров"}
                                                                    </span>
                                                                    {(ex.trainerNote || ex.clientNote) && (
                                                                        <span className="fb-row__sub">{[ex.trainerNote, ex.clientNote].filter(Boolean).join(" · ")}</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ))
                                                    )}
                                                    <button type="button" className="fb-add-link" onClick={() => navigate(`/trainings/${t.id}`)}>
                                                        Открыть тренировку ›
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </MobileShell>
    );
}
