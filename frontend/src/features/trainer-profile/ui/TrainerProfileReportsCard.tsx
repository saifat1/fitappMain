import type { TrainerClientResponse } from "../../trainer/model/trainer.types";
import type {
    TrainerReportFilters,
    TrainerReportsResponse,
    TrainerReportStatus,
} from "../model/trainerProfile.types";
import styles from "./TrainerProfile.module.css";

type Props = {
    clients: TrainerClientResponse[];
    filters: TrainerReportFilters;
    reports: TrainerReportsResponse | null;
    isLoading: boolean;
    errorMessage: string;
    onFilterChange: <K extends keyof TrainerReportFilters>(
        key: K,
        value: TrainerReportFilters[K]
    ) => void;
    onApply: () => void;
    onReset: () => void;
};

function getClientDisplayName(client: TrainerClientResponse): string {
    const fullName = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
    return fullName || client.email;
}

const statusOptions: Array<{ value: TrainerReportStatus; label: string }> = [
    { value: "ALL", label: "Все статусы" },
    { value: "PLANNED", label: "Запланированные" },
    { value: "COMPLETED", label: "Завершённые" },
    { value: "CANCELLED", label: "Отменённые" },
];

export default function TrainerProfileReportsCard({
                                                      clients,
                                                      filters,
                                                      reports,
                                                      isLoading,
                                                      errorMessage,
                                                      onFilterChange,
                                                      onApply,
                                                      onReset,
                                                  }: Props) {
    return (
        <section className={styles.card}>
            <div className={styles.cardHeader}>
                <div>
                    <h2 className={styles.cardTitle}>Отчёты по тренировкам</h2>
                    <p className={styles.cardSubtitle}>
                        Сводка по тренировкам тренера за выбранный период.
                    </p>
                </div>
            </div>

            {errorMessage && <div className={styles.messageError}>{errorMessage}</div>}

            <div className={styles.filtersGrid}>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="trainer-report-from">
                        Дата с
                    </label>
                    <input
                        id="trainer-report-from"
                        type="date"
                        className={styles.input}
                        value={filters.from}
                        onChange={(event) => onFilterChange("from", event.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="trainer-report-to">
                        Дата по
                    </label>
                    <input
                        id="trainer-report-to"
                        type="date"
                        className={styles.input}
                        value={filters.to}
                        onChange={(event) => onFilterChange("to", event.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="trainer-report-client">
                        Клиент
                    </label>
                    <select
                        id="trainer-report-client"
                        className={styles.input}
                        value={filters.clientId}
                        onChange={(event) => onFilterChange("clientId", event.target.value)}
                    >
                        <option value="">Все клиенты</option>
                        {clients.map((client) => (
                            <option key={client.id} value={String(client.id)}>
                                {getClientDisplayName(client)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="trainer-report-status">
                        Статус
                    </label>
                    <select
                        id="trainer-report-status"
                        className={styles.input}
                        value={filters.status}
                        onChange={(event) =>
                            onFilterChange("status", event.target.value as TrainerReportStatus)
                        }
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-primary"
                    onClick={onApply}
                    disabled={isLoading}
                >
                    {isLoading ? "Формируем..." : "Показать отчёт"}
                </button>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary"
                    onClick={onReset}
                    disabled={isLoading}
                >
                    Сбросить фильтры
                </button>
            </div>

            {reports && (
                <>
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>Всего тренировок</div>
                            <div className={styles.summaryValue}>{reports.summary.totalTrainings}</div>
                        </div>

                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>Завершено</div>
                            <div className={styles.summaryValue}>{reports.summary.completedTrainings}</div>
                        </div>

                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>Отменено</div>
                            <div className={styles.summaryValue}>{reports.summary.cancelledTrainings}</div>
                        </div>

                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>Запланировано</div>
                            <div className={styles.summaryValue}>{reports.summary.plannedTrainings}</div>
                        </div>

                        <div className={styles.summaryCard}>
                            <div className={styles.summaryLabel}>Клиентов с тренировками</div>
                            <div className={styles.summaryValue}>{reports.summary.clientsWithTrainings}</div>
                        </div>
                    </div>

                    {reports.rows.length === 0 ? (
                        <div className={styles.empty}>По выбранным фильтрам данных нет.</div>
                    ) : (
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>Клиент</th>
                                    <th>Email</th>
                                    <th>Всего</th>
                                    <th>Завершено</th>
                                    <th>Отменено</th>
                                    <th>Запланировано</th>
                                    <th>Последняя тренировка</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reports.rows.map((row) => (
                                    <tr key={row.clientId}>
                                        <td>{row.clientName}</td>
                                        <td>{row.clientEmail}</td>
                                        <td>{row.totalTrainings}</td>
                                        <td>{row.completedTrainings}</td>
                                        <td>{row.cancelledTrainings}</td>
                                        <td>{row.plannedTrainings}</td>
                                        <td>{row.lastTrainingDate ?? "—"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className={styles.tableHint}>
                        CSV-выгрузку добавим следующим шагом вместе с backend export endpoint.
                    </div>
                </>
            )}
        </section>
    );
}