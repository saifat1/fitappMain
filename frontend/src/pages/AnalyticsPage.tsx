import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileShell from "../widgets/MobileShell";
import {
    analyticsStatsApi,
    type AnalyticsSummary,
} from "../shared/api/analyticsStatsApi";

type QuickRange = "today" | "7d" | "30d" | "custom";

function formatDateTime(value?: string | null) {
    if (!value) {
        return "Никогда";
    }

    return new Date(value).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatName(firstName?: string | null, lastName?: string | null) {
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    return fullName || "—";
}

function formatRole(role: string) {
    if (role === "TRAINER") return "Тренер";
    if (role === "CLIENT") return "Клиент";
    return role;
}

function toInputDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function getLastDaysRange(days: number) {
    const to = new Date();
    const from = new Date();

    from.setDate(to.getDate() - days + 1);

    return {
        from: toInputDate(from),
        to: toInputDate(to),
    };
}

const QUICK_RANGES: { value: Exclude<QuickRange, "custom">; label: string; days: number }[] = [
    { value: "today", label: "Сегодня", days: 1 },
    { value: "7d", label: "7 дней", days: 7 },
    { value: "30d", label: "30 дней", days: 30 },
];

/** Admin: product usage stats (FIT-67 — new design, reached from the trainer profile). */
export default function AnalyticsPage() {
    const navigate = useNavigate();
    const defaultRange = useMemo(() => getLastDaysRange(7), []);

    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [quick, setQuick] = useState<QuickRange>("7d");
    const [from, setFrom] = useState(defaultRange.from);
    const [to, setTo] = useState(defaultRange.to);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    async function loadSummary(nextFrom: string, nextTo: string) {
        try {
            setLoading(true);
            setErrorText(null);

            const data = await analyticsStatsApi.getSummary({
                from: nextFrom,
                to: nextTo,
            });

            setSummary(data);
        } catch {
            setErrorText("Не удалось загрузить аналитику");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadSummary(defaultRange.from, defaultRange.to);
    }, [defaultRange]);

    function applyQuick(value: Exclude<QuickRange, "custom">, days: number) {
        const range = getLastDaysRange(days);

        setQuick(value);
        setFrom(range.from);
        setTo(range.to);

        void loadSummary(range.from, range.to);
    }

    function applyCustomRange() {
        setQuick("custom");
        void loadSummary(from, to);
    }

    const back = (
        <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
    );

    const tiles: { label: string; value: number }[] = summary
        ? [
              { label: "Входы тренеров", value: summary.trainerLoginCount },
              { label: "Входы клиентов", value: summary.clientLoginCount },
              { label: "Тренировок всего", value: summary.totalTrainings },
              { label: "Назначено", value: summary.plannedTrainings },
              { label: "Завершено", value: summary.completedTrainings },
              { label: "Активных клиентов", value: summary.activeClientsRange },
              { label: "Активных тренеров", value: summary.activeTrainersRange },
              { label: "Клиентов сегодня", value: summary.activeClientsToday },
              { label: "Клиентов за 7 дней", value: summary.activeClientsWeek },
              { label: "Тренеров сегодня", value: summary.activeTrainersToday },
              { label: "Тренеров за 7 дней", value: summary.activeTrainersWeek },
          ]
        : [];

    return (
        <MobileShell title="Аналитика" left={back} showTabBar={false}>
            <div className="fb-tab-panel fb-analytics">
                <div className="fb-chips fb-chips--wrap">
                    {QUICK_RANGES.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            className={`fb-chip ${quick === item.value ? "fb-chip--active" : ""}`}
                            onClick={() => applyQuick(item.value, item.days)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="fb-analytics__range">
                    <label className="fb-analytics__date">
                        <span>С</span>
                        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                    </label>
                    <label className="fb-analytics__date">
                        <span>По</span>
                        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                    </label>
                    <button
                        type="button"
                        className="fb-btn fb-btn--ghost fb-analytics__apply"
                        onClick={applyCustomRange}
                        disabled={loading}
                    >
                        Показать
                    </button>
                </div>

                {errorText && <div className="fb-cal-error">{errorText}</div>}

                {loading && !summary ? (
                    <div className="fb-empty">Загрузка…</div>
                ) : summary ? (
                    <>
                        <div className="fb-hint">
                            Период: {summary.rangeFrom} — {summary.rangeTo}
                        </div>

                        <div className="fb-stat-grid">
                            {tiles.map((tile) => (
                                <div key={tile.label} className="fb-stat-tile">
                                    <div className="fb-stat-tile__label">{tile.label}</div>
                                    <div className="fb-stat-tile__value">{tile.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="fb-section-title fb-section-title--flush">Частые события</div>
                        {summary.topEvents.length === 0 ? (
                            <div className="fb-empty">Событий за период нет</div>
                        ) : (
                            <div className="fb-list">
                                {summary.topEvents.map((event) => (
                                    <div key={event.eventType} className="fb-row">
                                        <span className="fb-row__main">
                                            <span className="fb-row__title fb-analytics__event">{event.eventType}</span>
                                        </span>
                                        <span className="fb-pill fb-pill--muted">{event.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="fb-section-title fb-section-title--flush">Давно не заходили</div>
                        <div className="fb-hint">Не зависит от периода: пользователи с самой старой активностью.</div>
                        {summary.inactiveUsers.length === 0 ? (
                            <div className="fb-empty">Пользователей нет</div>
                        ) : (
                            <div className="fb-list">
                                {summary.inactiveUsers.map((user) => (
                                    <div key={user.id} className="fb-row">
                                        <span className="fb-row__main">
                                            <span className="fb-row__title">
                                                {formatName(user.firstName, user.lastName)} · {formatRole(user.role)}
                                            </span>
                                            <span className="fb-row__sub">{user.email}</span>
                                            <span className="fb-row__sub">
                                                Активность: {formatDateTime(user.lastSeenAt)} · входов: {user.loginCount ?? 0}
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </MobileShell>
    );
}
