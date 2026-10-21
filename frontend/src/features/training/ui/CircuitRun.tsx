import { useEffect, useState } from "react";
import type { TrainingExerciseResponse } from "../../training-exercise/model/trainingExercise.types";
import { formatTimer, stationDescription, stationParams, stationSeconds } from "../model/circuit";
import { unlockAudio } from "../lib/beep";
import CircuitTimer from "./CircuitTimer";
import CircuitRestTimer from "./CircuitRestTimer";

type Props = {
    trainingId: number;
    rounds: number;
    /** null — no rest between rounds. */
    restSeconds: number | null;
    exercises: TrainingExerciseResponse[];
    /** Trainer only: opens the exercise editor. */
    onEditExercise?: (ex: TrainingExerciseResponse) => void;
    /** Trainer only: "Завершить тренировку" after the last round. */
    onComplete?: () => Promise<void>;
};

type RunState = {
    round: number;
    phase: "work" | "rest";
    /** Exercises ticked in the current round. */
    done: number[];
};

const INITIAL: RunState = { round: 1, phase: "work", done: [] };

function storageKey(trainingId: number) {
    return `fitapp.circuit-run.${trainingId}`;
}

// Progress lives on this device only: it's a stopwatch helper, not training data.
function loadState(trainingId: number, rounds: number): RunState {
    try {
        const raw = window.localStorage.getItem(storageKey(trainingId));
        if (!raw) return INITIAL;
        const parsed = JSON.parse(raw) as RunState;
        if (!parsed || typeof parsed.round !== "number" || parsed.round < 1 || parsed.round > rounds) return INITIAL;
        return { round: parsed.round, phase: parsed.phase === "rest" ? "rest" : "work", done: Array.isArray(parsed.done) ? parsed.done : [] };
    } catch {
        return INITIAL;
    }
}

/** Running a circuit training round by round (mockup approved in FIT-10). */
export default function CircuitRun({ trainingId, rounds, restSeconds, exercises, onEditExercise, onComplete }: Props) {
    const [state, setState] = useState<RunState>(() => loadState(trainingId, rounds));
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        try {
            window.localStorage.setItem(storageKey(trainingId), JSON.stringify(state));
        } catch {
            // private mode / storage blocked — progress just isn't remembered
        }
    }, [trainingId, state]);

    const isLast = state.round >= rounds;
    const rest = restSeconds ?? 0;
    const hasRest = rest > 0;

    const toggle = (id: number) => {
        setState((s) => ({ ...s, done: s.done.includes(id) ? s.done.filter((x) => x !== id) : [...s.done, id] }));
    };

    const finishRound = () => {
        unlockAudio();
        if (hasRest) {
            setState((s) => ({ ...s, phase: "rest" }));
        } else {
            setState((s) => ({ round: s.round + 1, phase: "work", done: [] }));
        }
    };

    const startNextRound = () => setState((s) => ({ round: s.round + 1, phase: "work", done: [] }));

    const restart = () => {
        if (window.confirm("Начать тренировку заново с 1-го круга?")) setState(INITIAL);
    };

    const complete = async () => {
        if (!onComplete) return;
        setCompleting(true);
        try {
            await onComplete();
            try {
                window.localStorage.removeItem(storageKey(trainingId));
            } catch {
                // ignore
            }
        } catch {
            // the page shows the error; progress is kept for a retry
        } finally {
            setCompleting(false);
        }
    };

    const dots = (
        <div className="fb-round__dots" aria-hidden="true">
            {Array.from({ length: rounds }, (_, i) => (
                <i key={i} className={i < state.round ? "fb-round__dot--on" : ""} />
            ))}
        </div>
    );

    if (state.phase === "rest" && hasRest) {
        return (
            <div className="fb-circuit-run">
                <div className="fb-round">
                    <b>Круг {state.round} из {rounds} завершён</b>
                    {dots}
                </div>
                <CircuitRestTimer key={`rest-${state.round}`} seconds={rest} />
                {exercises[0] && (
                    <div className="fb-round__next">
                        Дальше: <b>круг {state.round + 1}</b> — 1. {exercises[0].title}
                    </div>
                )}
                <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={startNextRound}>
                    Начать круг {state.round + 1}
                </button>
            </div>
        );
    }

    return (
        <div className="fb-circuit-run">
            <div className="fb-round">
                <div>
                    <div className="fb-round__label">Сейчас</div>
                    <b>Круг {state.round} из {rounds}</b>
                </div>
                {dots}
            </div>

            <div className="fb-list">
                {exercises.map((ex, index) => {
                    const checked = state.done.includes(ex.id);
                    const params = stationParams(ex);
                    const description = stationDescription(ex);
                    const seconds = stationSeconds(ex);
                    const title = `${index + 1}. ${ex.title}`;
                    return (
                        <div key={ex.id} className="fb-row fb-row--top">
                            <button
                                type="button"
                                className={`fb-row__radio ${checked ? "fb-row__radio--checked" : ""}`}
                                aria-label={checked ? "Отметить невыполненным в этом круге" : "Отметить выполненным в этом круге"}
                                onClick={() => toggle(ex.id)}
                            >
                                {checked ? "✓" : ""}
                            </button>
                            <div className="fb-row__main">
                                {onEditExercise ? (
                                    <button type="button" className="fb-row__title fb-row__title--link" onClick={() => onEditExercise(ex)}>
                                        {title}
                                    </button>
                                ) : (
                                    <span className="fb-row__title">{title}</span>
                                )}
                                {params && <span className="fb-row__sub">{params}</span>}
                                {description && <span className="fb-row__hint">{description}</span>}
                                {seconds != null && seconds > 0 && (
                                    <CircuitTimer key={`${ex.id}-${state.round}-${seconds}`} seconds={seconds} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isLast ? (
                onComplete ? (
                    <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={() => void complete()} disabled={completing}>
                        {completing ? "Завершаем…" : "Завершить тренировку"}
                    </button>
                ) : (
                    <div className="fb-hint">Последний круг</div>
                )
            ) : (
                <button type="button" className="fb-btn fb-btn--ghost fb-form-submit" onClick={finishRound}>
                    {hasRest
                        ? `Завершить круг ${state.round} → Отдых ${formatTimer(rest)}`
                        : `Завершить круг ${state.round} → Круг ${state.round + 1}`}
                </button>
            )}

            {(state.round > 1 || state.done.length > 0) && (
                <button type="button" className="fb-add-link" onClick={restart}>
                    Начать заново
                </button>
            )}
        </div>
    );
}
