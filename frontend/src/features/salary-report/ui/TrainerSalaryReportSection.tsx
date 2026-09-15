import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import FbTextField from "../../../shared/ui/FbTextField";
import { salaryReportApi } from "../../../shared/api/salaryReportApi";
import type { ApiErrorResponse } from "../../auth/model/auth.types";
import type { TrainerSalaryReportResponse } from "../model/salaryReport.types";

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

export default function TrainerSalaryReportSection() {
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
        <>
            <div className="fb-section-title fb-section-title--flush">Зарплатный отчёт</div>
            <div className="fb-hint">
                Отчёт по завершённым тренировкам и дежурным часам за выбранный месяц.
            </div>

            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            <FbTextField
                id="salary-report-month"
                label="Месяц"
                type="month"
                value={monthValue}
                onChange={setMonthValue}
            />

            <button
                type="button"
                className="fb-btn fb-btn--primary fb-form-submit"
                onClick={() => void handleExportPrintPdf()}
                disabled={isExportingPrintPdf}
            >
                {isExportingPrintPdf ? "Формируем форму…" : "Печатная форма PDF"}
            </button>

            <button
                type="button"
                className="fb-btn fb-btn--ghost"
                style={{ marginTop: 10 }}
                onClick={() => void loadReport(selectedPeriod.year, selectedPeriod.month)}
                disabled={isLoading}
            >
                {isLoading ? "Загружаем…" : "Обновить"}
            </button>

            {report && (
                <div className="fb-hint" style={{ paddingTop: 16 }}>
                    Тренер: {report.trainerName} · Период: {String(report.month).padStart(2, "0")}.{report.year}
                </div>
            )}

            {report && (
                <>
                    <div className="fb-stat-grid">
                        <div className="fb-stat-tile">
                            <div className="fb-stat-tile__label">Кол-во ПТ</div>
                            <div className="fb-stat-tile__value">{report.summary.personalTrainingCount}</div>
                        </div>

                        <div className="fb-stat-tile">
                            <div className="fb-stat-tile__label">Кол-во ЭТ</div>
                            <div className="fb-stat-tile__value">{report.summary.extraTrainingCount}</div>
                        </div>

                        <div className="fb-stat-tile">
                            <div className="fb-stat-tile__label">Деж. часов</div>
                            <div className="fb-stat-tile__value">{report.summary.dutyHoursCount}</div>
                        </div>
                    </div>

                    <div className="fb-section-title fb-section-title--flush" style={{ marginTop: 8 }}>
                        Завершённые тренировки
                    </div>

                    {report.trainingRows.length === 0 ? (
                        <div className="fb-empty">За выбранный месяц завершённых тренировок нет.</div>
                    ) : (
                        <div className="fb-list" style={{ margin: "0 -16px" }}>
                            {report.trainingRows.map((row) => (
                                <div key={row.trainingId} className="fb-row">
                                    <span className="fb-row__main">
                                        <span className="fb-row__title">
                                            {formatDate(row.date)} · {row.clientName}
                                        </span>
                                        <span className="fb-row__sub">
                                            {formatTime(row.startTime)}–{formatTime(row.endTime)} · {row.trainingTypeLabel}
                                            {row.contractNumber ? ` · Договор ${row.contractNumber}` : ""}
                                            {row.contractEndDate ? ` до ${formatDate(row.contractEndDate)}` : ""}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="fb-section-title fb-section-title--flush" style={{ marginTop: 8 }}>
                        Дежурные часы
                    </div>

                    {report.dutyRows.length === 0 ? (
                        <div className="fb-empty">За выбранный месяц дежурных часов нет.</div>
                    ) : (
                        <div className="fb-list" style={{ margin: "0 -16px" }}>
                            {report.dutyRows.map((row) => (
                                <div key={row.dutySlotId} className="fb-row">
                                    <span className="fb-row__main">
                                        <span className="fb-row__title">{formatDate(row.date)}</span>
                                        <span className="fb-row__sub">
                                            {formatTime(row.startTime)}–{formatTime(row.endTime)} · {row.typeLabel}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
}
