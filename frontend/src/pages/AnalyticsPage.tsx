import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MobileShell from "../widgets/MobileShell";
import ProductMetricsBlock from "../features/analytics/ui/ProductMetricsBlock";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import {
    analyticsStatsApi,
    type AnalyticsSummary,
    type ProductMetrics,
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

type UsersTab = "most" | "least";
type UsersRole = "TRAINER" | "CLIENT";

const USERS_TABS: { value: UsersTab; label: string }[] = [
    { value: "most", label: "Чаще всех" },
    { value: "least", label: "Реже всех" },
];

const USERS_ROLES: { value: UsersRole; label: string }[] = [
    { value: "TRAINER", label: "Тренеры" },
    { value: "CLIENT", label: "Клиенты" },
];

function StatTiles({ tiles }: { tiles: { label: string; value: number }[] }) {
    return (
        <div className="fb-stat-grid">
            {tiles.map((tile) => (
                <div key={tile.label} className="fb-stat-tile">
                    <div className="fb-stat-tile__label">{tile.label}</div>
                    <div className="fb-stat-tile__value">{tile.value}</div>
                </div>
            ))}
        </div>
    );
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
    const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
    const [quick, setQuick] = useState<QuickRange>("7d");
    const [from, setFrom] = useState(defaultRange.from);
    const [to, setTo] = useState(defaultRange.to);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [usersTab, setUsersTab] = useState<UsersTab>("most");
    const [usersRole, setUsersRole] = useState<UsersRole>("TRAINER");

    async function loadSummary(nextFrom: string, nextTo: string) {
        try {
            setLoading(true);
            setErrorText(null);

            const [data, productMetrics] = await Promise.all([
                analyticsStatsApi.getSummary({ from: nextFrom, to: nextTo }),
                analyticsStatsApi.getMetrics({ from: nextFrom, to: nextTo }),
            ]);

            setSummary(data);
            setMetrics(productMetrics);
        } catch (error) {
            setErrorText(
                axios.isAxiosError<ApiErrorResponse>(error)
                    ? error.response?.data?.message ?? "Не удалось загрузить аналитику"
                    : "Не удалось загрузить аналитику"
            );
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

    // Unique people who opened the app in the period, and how many times they opened it.
    const visitTiles: { label: string; value: number }[] = summary
        ? [
              { label: "Тренеров заходило", value: summary.activeTrainersRange },
              { label: "Клиентов заходило", value: summary.activeClientsRange },
              { label: "Заходов тренеров", value: summary.trainerVisits },
              { label: "Заходов клиентов", value: summary.clientVisits },
          ]
        : [];

    const trainingTiles: { label: string; value: number }[] = summary
        ? [
              { label: "Тренировок всего", value: summary.totalTrainings },
              { label: "Назначено", value: summary.plannedTrainings },
              { label: "Завершено", value: summary.completedTrainings },
          ]
        : [];

    const users = summary
        ? usersTab === "most"
            ? usersRole === "TRAINER" ? summary.mostActiveTrainers : summary.mostActiveClients
            : usersRole === "TRAINER" ? summary.leastActiveTrainers : summary.leastActiveClients
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

                        <div className="fb-section-title fb-section-title--flush">Заходили в приложение</div>
                        <div className="fb-hint">Уникальные люди за период и сколько раз они открывали приложение.</div>
                        <StatTiles tiles={visitTiles} />

                        <div className="fb-section-title fb-section-title--flush">Тренировки</div>
                        <StatTiles tiles={trainingTiles} />

                        {metrics && <ProductMetricsBlock metrics={metrics} />}

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

                        <div className="fb-section-title fb-section-title--flush">Пользователи</div>
                        <div className="fb-segment fb-analytics__segment">
                            {USERS_TABS.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    className={`fb-segment__item ${usersTab === item.value ? "fb-segment__item--active" : ""}`}
                                    onClick={() => setUsersTab(item.value)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <div className="fb-chips">
                            {USERS_ROLES.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    className={`fb-chip ${usersRole === item.value ? "fb-chip--active" : ""}`}
                                    onClick={() => setUsersRole(item.value)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <div className="fb-hint">
                            {usersTab === "most"
                                ? "За выбранный период: по числу дней с заходами, затем по числу заходов."
                                : "Не зависит от периода: у кого самая давняя активность (сверху — ни разу не заходили)."}
                        </div>
                        {users.length === 0 ? (
                            <div className="fb-empty">
                                {usersTab === "most" ? "За период никто не заходил" : "Пользователей нет"}
                            </div>
                        ) : (
                            <div className="fb-list">
                                {users.map((user, index) => (
                                    <div key={user.id} className="fb-row">
                                        <span className="fb-row__main">
                                            <span className="fb-row__title">
                                                {usersTab === "most" ? `${index + 1}. ` : ""}
                                                {formatName(user.firstName, user.lastName)}
                                            </span>
                                            <span className="fb-row__sub">{user.email}</span>
                                            <span className="fb-row__sub">
                                                {usersTab === "most"
                                                    ? `Дней с заходами: ${user.periodActiveDays ?? 0} · заходов: ${user.periodVisits ?? 0}`
                                                    : `Активность: ${formatDateTime(user.lastSeenAt)} · входов: ${user.loginCount ?? 0}`}
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
