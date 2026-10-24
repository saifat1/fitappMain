import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

import { progressApi, type ProgressSeries, type ProgressSummary } from "../shared/api/progressApi";
import ProgressChart, { Sparkline } from "../features/progress/ui/ProgressChart";
import { formatChange, formatDate, formatValue, METRIC_LABEL } from "../features/progress/lib/progressFormat";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

const PERIODS = [
    { months: 1, label: "1 мес" },
    { months: 3, label: "3 мес" },
    { months: 6, label: "6 мес" },
    { months: 12, label: "Год" },
    { months: 0, label: "Всё" },
];

/**
 * FIT-76: «Прогресс» — exercises of completed trainings with their change, and one exercise's chart (?key=).
 * The trainer opens it from the client card (/trainer/clients/:clientId/progress), the client from the profile.
 */
export default function ExerciseProgressPage() {
    const navigate = useNavigate();
    const { clientId: clientIdParam } = useParams<{ clientId: string }>();
    const clientId = clientIdParam ? Number(clientIdParam) : undefined;
    const [searchParams, setSearchParams] = useSearchParams();
    const key = searchParams.get("key");

    return key ? (
        <ExerciseChartView key={key} exerciseKey={key} clientId={clientId} onBack={() => navigate(-1)} />
    ) : (
        <ExerciseListView
            clientId={clientId}
            onBack={() => navigate(-1)}
            onOpen={(next) => setSearchParams({ key: next })}
        />
    );
}

function ExerciseListView({
    clientId,
    onBack,
    onOpen,
}: {
    clientId?: number;
    onBack: () => void;
    onOpen: (key: string) => void;
}) {
    const [items, setItems] = useState<ProgressSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let active = true;
        progressApi
            .getSummaries(clientId)
            .then((data) => active && setItems(data))
            .catch((error) => active && setErrorMessage(resolveApiError(error, "Не удалось загрузить прогресс")))
            .finally(() => active && setIsLoading(false));
        return () => {
            active = false;
        };
    }, [clientId]);

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={onBack}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">{clientId ? "Прогресс" : "Мой прогресс"}</h1>
            </header>

            <div className="fb-body">
                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : errorMessage ? (
                    <div className="fb-cal-error">{errorMessage}</div>
                ) : items.length === 0 ? (
                    <div className="fb-empty">
                        Пока нечего показать — прогресс появится после проведённых тренировок с весом, повторами или временем
                    </div>
                ) : (
                    <div className="fb-list">
                        {items.map((item) => {
                            const up = item.lastValue > item.firstValue;
                            return (
                                <button key={item.key} type="button" className="fb-row fb-row--button" onClick={() => onOpen(item.key)}>
                                    <span className="fb-row__main">
                                        <span className="fb-row__title">{item.title}</span>
                                        <span className="fb-row__sub">
                                            {item.trainings > 1
                                                ? `${formatValue(item.metric, item.firstValue)} → ${formatValue(item.metric, item.lastValue)} · `
                                                : `${formatValue(item.metric, item.lastValue)} · `}
                                            {formatDate(item.lastDate)}
                                        </span>
                                    </span>
                                    {item.trainings > 1 ? (
                                        <span className={`fb-progress-change${up ? " fb-progress-change--up" : ""}`}>
                                            {formatChange(item.metric, item.firstValue, item.lastValue)}
                                        </span>
                                    ) : null}
                                    <Sparkline values={item.recentValues} />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function ExerciseChartView({
    exerciseKey,
    clientId,
    onBack,
}: {
    exerciseKey: string;
    clientId?: number;
    onBack: () => void;
}) {
    const [series, setSeries] = useState<ProgressSeries | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [months, setMonths] = useState(3);
    const [volume, setVolume] = useState(false);

    useEffect(() => {
        let active = true;
        progressApi
            .getSeries(exerciseKey, clientId)
            .then((data) => active && setSeries(data))
            .catch((error) => active && setErrorMessage(resolveApiError(error, "Не удалось загрузить упражнение")))
            .finally(() => active && setIsLoading(false));
        return () => {
            active = false;
        };
    }, [exerciseKey, clientId]);

    const points = useMemo(() => {
        if (!series) return [];
        let list = series.points;
        if (months > 0) {
            const from = new Date();
            from.setMonth(from.getMonth() - months);
            const fromIso = from.toISOString().slice(0, 10);
            list = list.filter((p) => p.date >= fromIso);
        }
        // Volume: weight × reps over all sets; records are about the best weight only.
        return volume
            ? list.filter((p) => p.volume != null).map((p) => ({ ...p, value: p.volume as number, record: false }))
            : list;
    }, [series, months, volume]);

    const first = points[0];
    const last = points[points.length - 1];

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={onBack}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">{series?.title ?? "Упражнение"}</h1>
            </header>

            <div className="fb-body">
                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : errorMessage || !series ? (
                    <div className="fb-cal-error">{errorMessage || "Упражнение не найдено"}</div>
                ) : (
                    <>
                        <div className="fb-chips">
                            {PERIODS.map((period) => (
                                <button
                                    key={period.months}
                                    type="button"
                                    className={`fb-chip ${months === period.months ? "fb-chip--active" : ""}`}
                                    onClick={() => setMonths(period.months)}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>

                        {series.metric === "WEIGHT" ? (
                            <div className="fb-segment">
                                <button
                                    type="button"
                                    className={`fb-segment__item ${!volume ? "fb-segment__item--active" : ""}`}
                                    onClick={() => setVolume(false)}
                                >
                                    Лучший вес
                                </button>
                                <button
                                    type="button"
                                    className={`fb-segment__item ${volume ? "fb-segment__item--active" : ""}`}
                                    onClick={() => setVolume(true)}
                                >
                                    Объём
                                </button>
                            </div>
                        ) : null}

                        {first && last && points.length > 1 ? (
                            <div className="fb-progress-total">
                                {formatValue(series.metric, first.value)} → <b>{formatValue(series.metric, last.value)}</b>{" "}
                                <span className={`fb-progress-change${last.value > first.value ? " fb-progress-change--up" : ""}`}>
                                    {formatChange(series.metric, first.value, last.value)}
                                </span>
                            </div>
                        ) : null}

                        <ProgressChart key={`${months}-${volume}`} metric={series.metric} points={points} />

                        <div className="fb-hint">
                            {volume
                                ? "Объём — вес × повторы по всем подходам за тренировку."
                                : `На графике — ${METRIC_LABEL[series.metric]} за тренировку. Нажмите на точку, чтобы увидеть подходы.`}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
