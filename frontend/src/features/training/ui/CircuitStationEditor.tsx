import type { CircuitStation } from "../model/circuit";

type Props = {
    station: CircuitStation;
    number: number;
    onChange: (station: CircuitStation) => void;
    /** Omit to hide the "×" next to the title. */
    onRemove?: () => void;
};

/** One circuit exercise: numbered title, description and optional weight / time / reps. */
export default function CircuitStationEditor({ station, number, onChange, onRemove }: Props) {
    const set = (patch: Partial<CircuitStation>) => onChange({ ...station, ...patch });

    return (
        <div className="fb-circuit__station">
            <div className="fb-circuit__head">
                <span className="fb-circuit__num">{number}</span>
                <input
                    className="fb-circuit__input fb-circuit__input--title"
                    placeholder="Название упражнения"
                    aria-label={`Название упражнения ${number}`}
                    value={station.title}
                    onChange={(e) => set({ title: e.target.value })}
                />
                {onRemove && (
                    <button type="button" className="fb-row__remove" aria-label={`Убрать упражнение ${number}`} onClick={onRemove}>
                        ×
                    </button>
                )}
            </div>

            <div className="fb-circuit__body">
                <textarea
                    className="fb-circuit__input"
                    rows={2}
                    placeholder="Описание упражнения"
                    aria-label={`Описание, упражнение ${number}`}
                    value={station.description}
                    onChange={(e) => set({ description: e.target.value })}
                />

                <div className="fb-circuit__params">
                    <label className="fb-circuit__param">
                        <span className="fb-circuit__label">Вес, кг</span>
                        <input
                            className="fb-circuit__input"
                            inputMode="decimal"
                            placeholder="—"
                            value={station.weight}
                            onChange={(e) => set({ weight: e.target.value })}
                        />
                    </label>
                    <label className="fb-circuit__param">
                        <span className="fb-circuit__label">Время, мм:сс</span>
                        <input
                            className="fb-circuit__input"
                            inputMode="numeric"
                            placeholder="—"
                            value={station.time}
                            onChange={(e) => set({ time: e.target.value })}
                        />
                    </label>
                    <label className="fb-circuit__param">
                        <span className="fb-circuit__label">Повторения</span>
                        <input
                            className="fb-circuit__input"
                            inputMode="numeric"
                            placeholder="—"
                            value={station.reps}
                            onChange={(e) => set({ reps: e.target.value })}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
