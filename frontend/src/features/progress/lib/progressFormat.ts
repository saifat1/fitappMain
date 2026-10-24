import type { ProgressMetric } from "../../../shared/api/progressApi";

/** 72.5 → «72,5». */
export function formatNumber(value: number): string {
    return (Math.round(value * 100) / 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds} сек`;
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** «72,5 кг», «12 повт.», «1:30». */
export function formatValue(metric: ProgressMetric, value: number): string {
    if (metric === "WEIGHT") return `${formatNumber(value)} кг`;
    if (metric === "REPS") return `${formatNumber(value)} повт.`;
    return formatDuration(value);
}

/** «+12,5 кг», «−2 повт.», «без изменений». */
export function formatChange(metric: ProgressMetric, from: number, to: number): string {
    const diff = to - from;
    if (Math.abs(diff) < 0.005) return "без изменений";
    const sign = diff > 0 ? "+" : "−";
    const abs = Math.abs(diff);
    if (metric === "DURATION") return `${sign}${formatDuration(Math.round(abs))}`;
    return `${sign}${formatNumber(abs)} ${metric === "WEIGHT" ? "кг" : "повт."}`;
}

export function formatDate(iso: string, withYear = false): string {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: withYear ? "long" : "short",
        ...(withYear ? { year: "numeric" } : {}),
    });
}

export const METRIC_LABEL: Record<ProgressMetric, string> = {
    WEIGHT: "лучший вес",
    REPS: "больше всего повторений",
    DURATION: "время",
};
