import { useState } from "react";
import type { ProgressMetric, ProgressPoint } from "../../../shared/api/progressApi";
import { formatDate, formatValue } from "../lib/progressFormat";

const WIDTH = 320;
const HEIGHT = 180;
const PAD = { top: 16, right: 12, bottom: 24, left: 40 };

type Props = {
    metric: ProgressMetric;
    points: ProgressPoint[];
};

/** FIT-76: line chart of one exercise — a dot per completed training, tap a dot for its date and sets. */
export default function ProgressChart({ metric, points }: Props) {
    const [selected, setSelected] = useState<number | null>(points.length > 0 ? points.length - 1 : null);

    if (points.length === 0) {
        return <div className="fb-empty">За этот период тренировок с упражнением нет</div>;
    }

    const values = points.map((p) => p.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (max - min < 1e-6) {
        min -= 1;
        max += 1;
    }
    const plotW = WIDTH - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (points.length === 1 ? plotW / 2 : (i * plotW) / (points.length - 1));
    const y = (v: number) => PAD.top + plotH - ((v - min) / (max - min)) * plotH;
    const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
    const ticks = [max, (min + max) / 2, min];
    const point = selected != null ? points[selected] : null;

    return (
        <div className="fb-progress-chart">
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="График прогресса">
                {ticks.map((t) => (
                    <g key={t}>
                        <line className="fb-progress-chart__grid" x1={PAD.left} x2={WIDTH - PAD.right} y1={y(t)} y2={y(t)} />
                        <text className="fb-progress-chart__tick" x={PAD.left - 6} y={y(t) + 4} textAnchor="end">
                            {formatValue(metric, t).replace(/ (кг|повт\.)$/, "")}
                        </text>
                    </g>
                ))}
                <text className="fb-progress-chart__tick" x={PAD.left} y={HEIGHT - 6}>
                    {formatDate(points[0].date)}
                </text>
                {points.length > 1 ? (
                    <text className="fb-progress-chart__tick" x={WIDTH - PAD.right} y={HEIGHT - 6} textAnchor="end">
                        {formatDate(points[points.length - 1].date)}
                    </text>
                ) : null}
                <path className="fb-progress-chart__line" d={path} />
                {points.map((p, i) => (
                    <g key={`${p.trainingId}-${i}`} onClick={() => setSelected(i)} className="fb-progress-chart__hit">
                        <circle cx={x(i)} cy={y(p.value)} r={14} fill="transparent" />
                        <circle
                            className={`fb-progress-chart__dot${p.record ? " fb-progress-chart__dot--record" : ""}${
                                i === selected ? " fb-progress-chart__dot--active" : ""
                            }`}
                            cx={x(i)}
                            cy={y(p.value)}
                            r={i === selected ? 5.5 : 4}
                        />
                    </g>
                ))}
            </svg>

            {point ? (
                <div className="fb-progress-chart__detail">
                    <span>{formatDate(point.date, true)}</span>
                    <b>{formatValue(metric, point.value)}</b>
                    <span className="fb-progress-chart__sets">
                        {point.summary}
                        {point.record ? " · Рекорд!" : ""}
                    </span>
                </div>
            ) : null}
        </div>
    );
}

/** Mini chart for a row of the list. */
export function Sparkline({ values }: { values: number[] }) {
    if (values.length < 2) {
        return <svg className="fb-sparkline" viewBox="0 0 64 24" aria-hidden="true" />;
    }
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (max - min < 1e-6) {
        min -= 1;
        max += 1;
    }
    const d = values
        .map((v, i) => `${i === 0 ? "M" : "L"}${((i * 60) / (values.length - 1) + 2).toFixed(1)},${(22 - ((v - min) / (max - min)) * 20).toFixed(1)}`)
        .join(" ");
    return (
        <svg className="fb-sparkline" viewBox="0 0 64 24" aria-hidden="true">
            <path d={d} />
        </svg>
    );
}
