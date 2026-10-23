import type { ProductMetrics } from "../../../shared/api/analyticsStatsApi";

function percent(part: number, total: number): string {
    return total === 0 ? "—" : `${Math.round((part * 100) / total)}%`;
}

function cohortCell(active: number | null, registered: number): string {
    if (active == null) return "…";
    return registered === 0 ? "—" : `${active} (${percent(active, registered)})`;
}

function Tile({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="fb-stat-tile">
            <div className="fb-stat-tile__label">{label}</div>
            <div className="fb-stat-tile__value">{value}</div>
        </div>
    );
}

const TRAINING_TYPES: Record<string, string> = { PERSONAL: "Персональные", INDEPENDENT: "Самостоятельные", CIRCUIT: "Круговые" };

/** FIT-72: product metrics for the admin «Аналитика» screen — the same numbers go into the weekly report. */
export default function ProductMetricsBlock({ metrics }: { metrics: ProductMetrics }) {
    const { acquisition: acq, activation: act, retention, usage, money, quality } = metrics;

    return (
        <div className="fb-metrics">
            <div className="fb-section-title fb-section-title--flush">Привлечение</div>
            <div className="fb-stat-grid">
                <Tile label="Новых тренеров" value={acq.trainersRegistered} />
                <Tile label="Клиентов зарегистрировалось" value={acq.clientsRegistered} />
                <Tile label="Клиентов добавлено" value={acq.clientsAddedByTrainers} />
            </div>
            {acq.trainersBySource.length > 0 && (
                <div className="fb-hint">
                    Откуда тренеры: {acq.trainersBySource.map((r) => `${r.source} — ${r.count}`).join(", ")}
                </div>
            )}

            <div className="fb-section-title fb-section-title--flush">Активация за {act.days} дней</div>
            <div className="fb-metrics__funnel">
                {[
                    ["Зарегистрировались", act.registered],
                    ["Добавили клиента", act.addedClient],
                    ["Создали тренировку", act.createdTraining],
                    ["Провели тренировку", act.completedTraining],
                ].map(([label, value]) => (
                    <div key={label as string} className="fb-metrics__step">
                        <span>{label}</span>
                        <b>
                            {value} <span className="fb-metrics__pct">{percent(value as number, act.registered)}</span>
                        </b>
                    </div>
                ))}
            </div>

            <div className="fb-section-title fb-section-title--flush">Удержание тренеров по неделям</div>
            <div className="fb-metrics__table-wrap">
                <table className="fb-metrics__table">
                    <thead>
                        <tr>
                            <th>Неделя</th>
                            <th>Новых</th>
                            <th>Через 1 нед.</th>
                            <th>Через 4</th>
                            <th>Через 12</th>
                        </tr>
                    </thead>
                    <tbody>
                        {retention.map((row) => (
                            <tr key={row.weekStart}>
                                <td>{new Date(row.weekStart).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</td>
                                <td>{row.registered}</td>
                                <td>{cohortCell(row.activeWeek1, row.registered)}</td>
                                <td>{cohortCell(row.activeWeek4, row.registered)}</td>
                                <td>{cohortCell(row.activeWeek12, row.registered)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="fb-hint">«…» — эта неделя ещё не наступила.</div>

            <div className="fb-section-title fb-section-title--flush">Использование</div>
            <div className="fb-stat-grid">
                <Tile label="Активных тренеров" value={usage.activeTrainers} />
                <Tile label="Активных клиентов" value={usage.activeClients} />
                <Tile label="Проведено тренировок" value={usage.trainingsCompleted} />
                <Tile label="На активного тренера" value={usage.trainingsCompletedPerActiveTrainer} />
                <Tile label="Записей клиентами" value={`${usage.bookingRequestsApproved} из ${usage.bookingRequests}`} />
                <Tile label="Новых договоров" value={usage.contractsCreated} />
                <Tile label="Отменено тренировок" value={usage.trainingsCancelled} />
                <Tile label="Обращений" value={usage.feedbackReceived} />
                <Tile label="Телефонов с пушами" value={usage.appDevicesWithPush} />
            </div>
            {usage.trainingsByType.length > 0 && (
                <div className="fb-hint">
                    По видам: {usage.trainingsByType.map((r) => `${TRAINING_TYPES[r.type as string] ?? r.type} — ${r.count}`).join(", ")}
                </div>
            )}

            <div className="fb-section-title fb-section-title--flush">Деньги</div>
            <div className="fb-stat-grid">
                <Tile label="Выручка, ₽" value={money.revenueRub.toLocaleString("ru-RU")} />
                <Tile label="Оплат" value={money.paymentsSucceeded} />
                <Tile label="Новых платящих" value={money.newPayingTrainers} />
                <Tile label="Продлений" value={money.renewalsSucceeded} />
                <Tile label="Платящих сейчас" value={money.activePaidNow} />
                <Tile label="На пробном сейчас" value={money.inTrialNow} />
                <Tile label="Автопродление выкл." value={money.autoRenewOffNow} />
                <Tile label="Неудачных оплат" value={money.paymentsFailed} />
            </div>

            <div className="fb-section-title fb-section-title--flush">Качество</div>
            <div className="fb-stat-grid">
                <Tile label="Ошибок сервера" value={quality.serverErrorsSinceStart} />
                <Tile label="Неудачных оплат" value={quality.paymentsFailed} />
            </div>
            <div className="fb-hint">
                Ошибки считаются с запуска сервера{" "}
                {new Date(quality.backendStartedAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.
            </div>
        </div>
    );
}
