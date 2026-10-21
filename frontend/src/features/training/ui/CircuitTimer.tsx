import { formatTimer } from "../model/circuit";
import { useCountdown } from "../lib/useCountdown";

type Props = {
    seconds: number;
};

/** Exercise countdown; beeps on the last 3 seconds and plays a signal when time is up. */
export default function CircuitTimer({ seconds }: Props) {
    const { remaining, running, start, pause, reset } = useCountdown(seconds);
    const finished = remaining === 0;

    return (
        <div className={`fb-timer ${running ? "fb-timer--running" : ""} ${finished ? "fb-timer--done" : ""}`}>
            <span className="fb-timer__time" aria-live="polite">
                {finished ? "Время вышло" : formatTimer(remaining)}
            </span>
            {running ? (
                <button type="button" className="fb-timer__btn" onClick={pause}>
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
