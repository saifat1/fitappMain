import { useCountdownTimer } from "../lib/useCountdownTimer";

type Props = {
    durationSeconds: number | null;
};

function formatDurationLabel(seconds: number): string {
    if (seconds < 60) {
        return `${seconds} сек`;
    }

    const minutes = Math.floor(seconds / 60);
    const restSeconds = seconds % 60;

    if (restSeconds === 0) {
        return `${minutes} мин`;
    }

    return `${minutes} мин ${restSeconds} сек`;
}

export default function ExerciseTimerPanel({ durationSeconds }: Props) {
    if (durationSeconds == null || durationSeconds <= 0) {
        return null;
    }

    const {
        isRunning,
        isFinished,
        formattedTime,
        start,
        pause,
        reset,
    } = useCountdownTimer({
        initialSeconds: durationSeconds,
    });

    return (
        <div className="timer-panel">
            <div className="timer-panel-header">
                <strong>Таймер упражнения</strong>
                <span className="timer-panel-hint">
          План: {formatDurationLabel(durationSeconds)}
        </span>
            </div>

            <div className={isFinished ? "timer-value finished" : "timer-value"}>
                {formattedTime}
            </div>

            <div className="timer-actions">
                {!isRunning ? (
                    <button type="button" onClick={start} disabled={isFinished}>
                        Старт
                    </button>
                ) : (
                    <button type="button" onClick={pause}>
                        Пауза
                    </button>
                )}

                <button type="button" onClick={reset}>
                    Сброс
                </button>
            </div>
        </div>
    );
}