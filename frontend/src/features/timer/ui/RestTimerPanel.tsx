import { useCountdownTimer } from "../lib/useCountdownTimer";

type Props = {
    restSeconds: number | null;
};

function formatDurationLabel(seconds: number): string {
    if (seconds < 60) {
        return `${seconds} сек`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) {
        return `${minutes} мин`;
    }

    return `${minutes} мин ${remainingSeconds} сек`;
}

export default function RestTimerPanel({ restSeconds }: Props) {
    if (restSeconds == null || restSeconds < 0) {
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
        initialSeconds: restSeconds,
    });

    return (
        <div className="timer-panel timer-panel-rest">
            <div className="timer-panel-header">
                <strong>Таймер отдыха</strong>
                <span className="timer-panel-hint">
          План: {formatDurationLabel(restSeconds)}
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