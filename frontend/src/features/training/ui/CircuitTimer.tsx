import { useEffect, useRef, useState } from "react";
import { formatTimer } from "../model/circuit";
import { playFinish, playTick, unlockAudio } from "../lib/beep";

type Props = {
    seconds: number;
};

/** Countdown for a circuit station; beeps on the last 3 seconds and plays a signal when time is up. */
export default function CircuitTimer({ seconds }: Props) {
    const [remaining, setRemaining] = useState(seconds);
    const [running, setRunning] = useState(false);
    // Wall-clock end time, so the countdown stays correct if the tab throttles intervals.
    const endsAt = useRef(0);
    const lastTick = useRef(-1);

    useEffect(() => {
        if (!running) return;
        const timer = window.setInterval(() => {
            const left = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
            setRemaining(left);
            if (left > 0 && left <= 3 && lastTick.current !== left) {
                lastTick.current = left;
                playTick();
            }
            if (left === 0) {
                setRunning(false);
                playFinish();
            }
        }, 200);
        return () => window.clearInterval(timer);
    }, [running]);

    const start = () => {
        unlockAudio();
        const from = remaining > 0 ? remaining : seconds;
        endsAt.current = Date.now() + from * 1000;
        lastTick.current = -1;
        setRemaining(from);
        setRunning(true);
    };

    const reset = () => {
        setRunning(false);
        setRemaining(seconds);
    };

    const finished = remaining === 0;

    return (
        <div className={`fb-timer ${running ? "fb-timer--running" : ""} ${finished ? "fb-timer--done" : ""}`}>
            <span className="fb-timer__time" aria-live="polite">
                {finished ? "Время вышло" : formatTimer(remaining)}
            </span>
            {running ? (
                <button type="button" className="fb-timer__btn" onClick={() => setRunning(false)}>
                    Пауза
                </button>
            ) : (
                <button type="button" className="fb-timer__btn fb-timer__btn--primary" onClick={start}>
                    {finished ? "Заново" : remaining < seconds ? "Продолжить" : "Старт"}
                </button>
            )}
            {(running || remaining < seconds) && !finished && (
                <button type="button" className="fb-timer__btn" onClick={reset}>
                    Сброс
                </button>
            )}
        </div>
    );
}
