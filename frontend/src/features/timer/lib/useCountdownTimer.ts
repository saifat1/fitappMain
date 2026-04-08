import { useEffect, useMemo, useRef, useState } from "react";

type UseCountdownTimerParams = {
    initialSeconds: number;
};

type UseCountdownTimerResult = {
    remainingSeconds: number;
    isRunning: boolean;
    isFinished: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
    setRemainingSeconds: (value: number) => void;
    formattedTime: string;
};

function formatSeconds(totalSeconds: number): string {
    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useCountdownTimer(
    params: UseCountdownTimerParams
): UseCountdownTimerResult {
    const { initialSeconds } = params;

    const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        setRemainingSeconds(initialSeconds);
        setIsRunning(false);
    }, [initialSeconds]);

    useEffect(() => {
        if (!isRunning) {
            return;
        }

        intervalRef.current = window.setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    useEffect(() => {
        return () => {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, []);

    const formattedTime = useMemo(
        () => formatSeconds(remainingSeconds),
        [remainingSeconds]
    );

    return {
        remainingSeconds,
        isRunning,
        isFinished: remainingSeconds === 0,
        start: () => {
            if (remainingSeconds > 0) {
                setIsRunning(true);
            }
        },
        pause: () => setIsRunning(false),
        reset: () => {
            setIsRunning(false);
            setRemainingSeconds(initialSeconds);
        },
        setRemainingSeconds,
        formattedTime,
    };
}