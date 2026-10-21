import { useEffect, useRef, useState } from "react";
import { formatTimer } from "../model/circuit";
import { useCountdown } from "../lib/useCountdown";

type Props = {
    seconds: number;
};

/** Rest after a round: starts right away (the tap on "→ Отдых" unlocks audio), big ring, +30 сек. */
export default function CircuitRestTimer({ seconds }: Props) {
    const [total, setTotal] = useState(seconds);
    const { remaining, running, start, pause, add } = useCountdown(seconds);
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        start();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- start once on mount
    }, []);

    const finished = remaining === 0;
    const progress = total > 0 ? Math.min(100, Math.round(((total - remaining) / total) * 100)) : 100;

    return (
        <div className={`fb-rest ${finished ? "fb-rest--done" : ""}`}>
            <div className="fb-rest__label">{finished ? "Отдых окончен" : "Отдых"}</div>
            <div className="fb-rest__ring" style={{ background: `conic-gradient(var(--fb-green) 0 ${progress}%, var(--fb-surface-2) ${progress}% 100%)` }}>
                <div className="fb-rest__inner">
                    <span className="fb-rest__time" aria-live="polite">{formatTimer(remaining)}</span>
                    <span className="fb-rest__of">из {formatTimer(total)}</span>
                </div>
            </div>
            {!finished && (
                <div className="fb-rest__actions">
                    {running ? (
                        <button type="button" className="fb-timer__btn" onClick={pause}>Пауза</button>
                    ) : (
                        <button type="button" className="fb-timer__btn fb-timer__btn--primary" onClick={start}>Продолжить</button>
                    )}
                    <button type="button" className="fb-timer__btn" onClick={() => { setTotal((t) => t + 30); add(30); }}>
                        +30 сек
                    </button>
                </div>
            )}
        </div>
    );
}
