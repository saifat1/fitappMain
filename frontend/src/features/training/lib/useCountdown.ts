import { useEffect, useRef, useState } from "react";
import { playFinish, playTick, unlockAudio } from "./beep";

/**
 * Countdown with sound: pips on the last 3 seconds, a finish signal at 0.
 * Counts against a wall-clock end time, so it stays correct if the tab throttles intervals.
 */
export function useCountdown(total: number, onFinish?: () => void) {
    const [remaining, setRemaining] = useState(total);
    const [running, setRunning] = useState(false);
    const endsAt = useRef(0);
    const lastTick = useRef(-1);
    const finishRef = useRef(onFinish);

    useEffect(() => {
        finishRef.current = onFinish;
    }, [onFinish]);

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
                finishRef.current?.();
            }
        }, 200);
        return () => window.clearInterval(timer);
    }, [running]);

    /** Call from a tap handler: mobile browsers only allow audio after a user gesture. */
    const start = () => {
        unlockAudio();
        const from = remaining > 0 ? remaining : total;
        endsAt.current = Date.now() + from * 1000;
        lastTick.current = -1;
        setRemaining(from);
        setRunning(true);
    };

    const pause = () => setRunning(false);

    const reset = () => {
        setRunning(false);
        setRemaining(total);
    };

    const add = (seconds: number) => {
        endsAt.current += seconds * 1000;
        setRemaining((r) => r + seconds);
    };

    return { remaining, running, start, pause, reset, add };
}
