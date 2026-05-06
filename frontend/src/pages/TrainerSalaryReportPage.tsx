import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "../features/salary-report/ui/TrainerSalaryReportPage.module.css";
import { salaryReportApi } from "../shared/api/salaryReportApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { TrainerSalaryReportResponse } from "../features/salary-report/model/salaryReport.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function getCurrentMonthValue(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function parseMonthValue(value: string): { year: number; month: number } {
    const [year, month] = value.split("-").map(Number);
    return { year, month };
}

function formatDate(value: string | null): string {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleDateString("ru-RU");
}

function formatTime(value: string | null): string {
    if (!value) {
        return "—";
    }

    return value.slice(0, 5);
}

function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
}

export default function TrainerSalaryReportPage() {
    const [monthValue, setMonthValue] = useState(getCurrentMonthValue());
    const [report, setReport] = useState<TrainerSalaryReportResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExportingPrintPdf, setIsExportingPrintPdf] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const selectedPeriod = useMemo(() => parseMonthValue(monthValue), [monthValue]);

    const loadReport = async (year: number, month: number) => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await salaryReportApi.getCurrentTrainerSalaryReport(year, month);
            setReport(data);
        } catch (error) {
            setErrorMessage(
                resolveApiError(error, "Не удалось загрузить зарплатный отчёт")
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadReport(selectedPeriod.year, selectedPeriod.month);
    }, [selectedPeriod.year, selectedPeriod.month]);

    const handleExportPrintPdf = async () => {
        setErrorMessage("");
        setIsExportingPrintPdf(true);

        try {
            const blob = await salaryReportApi.exportCurrentTrainerSalaryReportPrintPdf(
                selectedPeriod.year,
                selectedPeriod.month
            );

            downloadBlob(
                blob,
                `salary-report-print-${selectedPeriod.year}-${String(selectedPeriod.month).padStart(2, "0")}.pdf`
            );
        } catch (error) {
            setErrorMessage(
                resolveApiError(error, "Не удалось выгрузить печатную форму PDF")
            );
        } finally {
            setIsExportingPrintPdf(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Зарплатный отчёт</h1>
                <p className={styles.subtitle}>
                    Отчёт по завершённым тренировкам и дежурным часам за выбранный месяц.
                </p>
            </div>

            {errorMessage && <div className={styles.error}>{errorMessage}</div>}

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>Период</h2>

                <div className={styles.controls}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="salary-report-month">
                            Месяц
                        </label>
                        <input
                            id="salary-report-month"
                            className={styles.input}
                            type="month"
                            value={monthValue}
                            onChange={(event) => setMonthValue(event.target.value)}
                        />
                    </div>

                    <div className={styles.controlActions}>
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => void loadReport(selectedPeriod.year, selectedPeriod.month)}
                            disabled={isLoading}
                        >
                            {isLoading ? "Загружаем..." : "Обновить"}
                        </button>

                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-primary"
                            onClick={() => void handleExportPrintPdf()}
                            disabled={isExportingPrintPdf}
                        >
                            {isExportingPrintPdf ? "Формируем форму..." : "Печатная форма PDF"}
                        </button>
                    </div>
                </div>

                {report && (
                    <div className={styles.meta}>
                        <div>Тренер: {report.trainerName}</div>
                        <div>
                            Период: {String(report.month).padStart(2, "0")}.{report.year}
                        </div>
                    </div>
                )}
            </section>

            {report && (
                <>
                    <section className={styles.card}>
                        <h2 className={styles.sectionTitle}>Итоги</h2>

                        <div className={styles.summaryGrid}>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>Кол-во ПТ</div>
                                <div className={styles.summaryValue}>
                                    {report.summary.personalTrainingCount}
                                </div>
                            </div>

                            <div className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>Кол-во ЭТ</div>
                                <div className={styles.summaryValue}>
                                    {report.summary.extraTrainingCount}
                                </div>
                            </div>

                            <div className={styles.summaryCard}>
                                <div className={styles.summaryLabel}>Кол-во дежурных часов</div>
                                <div className={styles.summaryValue}>
                                    {report.summary.dutyHoursCount}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.card}>
                        <h2 className={styles.sectionTitle}>Завершённые тренировки</h2>

                        {report.trainingRows.length === 0 ? (
                            <div className={styles.empty}>
                                За выбранный месяц завершённых тренировок нет.
                            </div>
                        ) : (
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Время</th>
                                        <th>Клиент</th>
                                        <th>Вид</th>
                                        <th>Договор</th>
                                        <th>Дата окончания договора</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {report.trainingRows.map((row) => (
                                        <tr key={row.trainingId}>
                                            <td>{formatDate(row.date)}</td>
                                            <td>
                                                {formatTime(row.startTime)} — {formatTime(row.endTime)}
                                            </td>
                                            <td>{row.clientName}</td>
                                            <td>
                          <span className={styles.typeBadge}>
                            {row.trainingTypeLabel}
                          </span>
                                            </td>
                                            <td>{row.contractNumber ?? "—"}</td>
                                            <td>{formatDate(row.contractEndDate)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className={styles.card}>
                        <h2 className={styles.sectionTitle}>Дежурные часы</h2>

                        {report.dutyRows.length === 0 ? (
                            <div className={styles.empty}>
                                За выбранный месяц дежурных часов нет.
                            </div>
                        ) : (
                            <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                    <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Время</th>
                                        <th>Тип</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {report.dutyRows.map((row) => (
                                        <tr key={row.dutySlotId}>
                                            <td>{formatDate(row.date)}</td>
                                            <td>
                                                {formatTime(row.startTime)} — {formatTime(row.endTime)}
                                            </td>
                                            <td>
                                                <span className={styles.dutyBadge}>{row.typeLabel}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className={styles.helper}>
                            Используется только печатная форма PDF.
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}