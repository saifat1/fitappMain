import { useEffect, useState } from "react";
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

export default function AnalyticsPage() {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorText, setErrorText] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadSummary() {
            try {
                setLoading(true);
                setErrorText(null);

                const data = await analyticsStatsApi.getSummary();

                if (mounted) {
                    setSummary(data);
                }
            } catch {
                if (mounted) {
                    setErrorText("Не удалось загрузить аналитику. Проверь доступ и backend.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        void loadSummary();

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="page-card">
                <h1>Аналитика</h1>
                <p className="muted">Загрузка...</p>
            </div>
        );
    }

    if (errorText || !summary) {
        return (
            <div className="page-card">
                <h1>Аналитика</h1>
                <p className="error-text">{errorText ?? "Нет данных"}</p>
            </div>
        );
    }

    return (
        <div className="page-card">
            <div className="page-header">
                <div>
                    <h1>Аналитика</h1>
                    <p className="muted">
                        Общая активность пользователей и ключевые события приложения.
                    </p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Логины тренеров</div>
                    <div className="stat-value">{summary.trainerLoginCount}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Логины клиентов</div>
                    <div className="stat-value">{summary.clientLoginCount}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Всего тренировок</div>
                    <div className="stat-value">{summary.totalTrainings}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Назначено тренировок</div>
                    <div className="stat-value">{summary.plannedTrainings}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Завершено тренировок</div>
                    <div className="stat-value">{summary.completedTrainings}</div>
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
                <h2>Самые частые события</h2>

                {summary.topEvents.length === 0 ? (
                    <p className="muted">Событий пока нет.</p>
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
        </div>
    );
}