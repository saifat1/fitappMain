import { useEffect, useMemo, useState } from "react";
import {
    analyticsStatsApi,
    type AnalyticsSummary,
} from "../shared/api/analyticsStatsApi";

function formatDateTime(value?: string | null) {
    if (!value) {
        return "Никогда";
    }

    return new Date(value).toLocaleString("ru-RU");
}

function formatName(firstName?: string | null, lastName?: string | null) {
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    return fullName || "—";
}

function toInputDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

function getTodayRange() {
    const today = toInputDate(new Date());

    return {
        from: today,
        to: today,
    };
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

export default function AnalyticsPage() {
    const defaultRange = useMemo(() => getLastDaysRange(7), []);

    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [from, setFrom] = useState(defaultRange.from);
    const [to, setTo] = useState(defaultRange.to);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    async function loadSummary(nextFrom = from, nextTo = to) {
        try {
            setLoading(true);
            setErrorText(null);

            const data = await analyticsStatsApi.getSummary({
                from: nextFrom,
                to: nextTo,
            });

            setSummary(data);
        } catch {
            setErrorText("Не удалось загрузить аналитику. Проверь доступ и backend.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadSummary(defaultRange.from, defaultRange.to);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function applyToday() {
        const range = getTodayRange();

        setFrom(range.from);
        setTo(range.to);

        void loadSummary(range.from, range.to);
    }

    function applyWeek() {
        const range = getLastDaysRange(7);

        setFrom(range.from);
        setTo(range.to);

        void loadSummary(range.from, range.to);
    }

    function applyMonth() {
        const range = getLastDaysRange(30);

        setFrom(range.from);
        setTo(range.to);

        void loadSummary(range.from, range.to);
    }

    function applyCustomRange() {
        void loadSummary(from, to);
    }

    if (loading && !summary) {
        return (
            <div className="page-card">
                <h1>Аналитика</h1>
                <p className="muted">Загрузка...</p>
            </div>
        );
    }

    if (errorText && !summary) {
        return (
            <div className="page-card">
                <h1>Аналитика</h1>
                <p className="error-text">{errorText}</p>
            </div>
        );
    }

    return (
        <div className="page-card">
            <div className="page-header">
                <div>
                    <h1>Аналитика</h1>
                    <p className="muted">
                        Статистика за период: {summary?.rangeFrom ?? from} —{" "}
                        {summary?.rangeTo ?? to}
                    </p>
                </div>
            </div>

            <div className="analytics-filters">
                <div className="analytics-filters__quick">
                    <button type="button" className="secondary-button" onClick={applyToday}>
                        Сегодня
                    </button>

                    <button type="button" className="secondary-button" onClick={applyWeek}>
                        7 дней
                    </button>

                    <button type="button" className="secondary-button" onClick={applyMonth}>
                        30 дней
                    </button>
                </div>

                <div className="analytics-filters__range">
                    <label>
                        С
                        <input
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                    </label>

                    <label>
                        По
                        <input
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                        />
                    </label>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={applyCustomRange}
                        disabled={loading}
                    >
                        Применить
                    </button>
                </div>
            </div>

            {errorText && <p className="error-text">{errorText}</p>}

            {summary && (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Логины тренеров за период</div>
                            <div className="stat-value">{summary.trainerLoginCount}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Логины клиентов за период</div>
                            <div className="stat-value">{summary.clientLoginCount}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Всего тренировок за период</div>
                            <div className="stat-value">{summary.totalTrainings}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Назначено тренировок за период</div>
                            <div className="stat-value">{summary.plannedTrainings}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Завершено тренировок за период</div>
                            <div className="stat-value">{summary.completedTrainings}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Активные клиенты за период</div>
                            <div className="stat-value">{summary.activeClientsRange}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Активные тренеры за период</div>
                            <div className="stat-value">{summary.activeTrainersRange}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Активные клиенты сегодня</div>
                            <div className="stat-value">{summary.activeClientsToday}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Активные клиенты за 7 дней</div>
                            <div className="stat-value">{summary.activeClientsWeek}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Активные тренеры сегодня</div>
                            <div className="stat-value">{summary.activeTrainersToday}</div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Активные тренеры за 7 дней</div>
                            <div className="stat-value">{summary.activeTrainersWeek}</div>
                        </div>
                    </div>

                    <section className="section-block">
                        <h2>Самые частые события за период</h2>

                        {summary.topEvents.length === 0 ? (
                            <p className="muted">Событий за выбранный период нет.</p>
                        ) : (
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                    <tr>
                                        <th>Событие</th>
                                        <th>Количество</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {summary.topEvents.map((event) => (
                                        <tr key={event.eventType}>
                                            <td>{event.eventType}</td>
                                            <td>{event.count}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="section-block">
                        <h2>Кто давно не заходил</h2>
                        <p className="muted">
                            Этот блок не зависит от выбранного периода и показывает пользователей
                            с самой старой активностью.
                        </p>

                        {summary.inactiveUsers.length === 0 ? (
                            <p className="muted">Пользователей нет.</p>
                        ) : (
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                    <tr>
                                        <th>Пользователь</th>
                                        <th>Email</th>
                                        <th>Роль</th>
                                        <th>Последний логин</th>
                                        <th>Последняя активность</th>
                                        <th>Всего логинов</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {summary.inactiveUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>{formatName(user.firstName, user.lastName)}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>{formatDateTime(user.lastLoginAt)}</td>
                                            <td>{formatDateTime(user.lastSeenAt)}</td>
                                            <td>{user.loginCount ?? 0}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}