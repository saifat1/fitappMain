import { useState } from "react";
import { newStation, type CircuitStation } from "../model/circuit";

type Props = {
    stations: CircuitStation[];
    onChange: (stations: CircuitStation[]) => void;
};

export default function CircuitExercisesEditor({ stations, onChange }: Props) {
    const [fieldMenuFor, setFieldMenuFor] = useState<string | null>(null);

    const update = (key: string, patch: Partial<CircuitStation>) => {
        onChange(stations.map((s) => (s.key === key ? { ...s, ...patch } : s)));
    };

    const remove = (key: string) => {
        onChange(stations.filter((s) => s.key !== key));
    };

    return (
        <div className="fb-circuit">
            {stations.map((station, index) => {
                const canAddText = station.text === null;
                const canAddTimer = station.timer === null;

                return (
                    <div key={station.key} className="fb-circuit__station">
                        <div className="fb-circuit__head">
                            <span className="fb-circuit__num">{index + 1}</span>
                            <input
                                className="fb-circuit__input fb-circuit__input--title"
                                placeholder="Название упражнения"
                                aria-label={`Название упражнения ${index + 1}`}
                                value={station.title}
                                onChange={(e) => update(station.key, { title: e.target.value })}
                            />
                            <button
                                type="button"
                                className="fb-row__remove"
                                aria-label={`Убрать упражнение ${index + 1}`}
                                onClick={() => remove(station.key)}
                            >
                                ×
                            </button>
                        </div>

                        {station.text !== null && (
                            <div className="fb-circuit__field">
                                <span className="fb-circuit__label">Текст</span>
                                <textarea
                                    className="fb-circuit__input"
                                    rows={2}
                                    aria-label={`Текст, упражнение ${index + 1}`}
                                    value={station.text}
                                    onChange={(e) => update(station.key, { text: e.target.value })}
                                />
                                <button type="button" className="fb-row__remove" aria-label="Убрать текст" onClick={() => update(station.key, { text: null })}>
                                    ×
                                </button>
                            </div>
                        )}

                        {station.timer !== null && (
                            <div className="fb-circuit__field">
                                <span className="fb-circuit__label">Секундомер</span>
                                <input
                                    className="fb-circuit__input fb-circuit__input--timer"
                                    inputMode="numeric"
                                    placeholder="мм:сс"
                                    aria-label={`Секундомер, упражнение ${index + 1}`}
                                    value={station.timer}
                                    onChange={(e) => update(station.key, { timer: e.target.value })}
                                />
                                <button type="button" className="fb-row__remove" aria-label="Убрать секундомер" onClick={() => update(station.key, { timer: null })}>
                                    ×
                                </button>
                            </div>
                        )}

                        {(canAddText || canAddTimer) && (
                            fieldMenuFor === station.key ? (
                                <div className="fb-chips fb-chips--wrap fb-circuit__menu">
                                    {canAddText && (
                                        <button type="button" className="fb-chip" onClick={() => { update(station.key, { text: "" }); setFieldMenuFor(null); }}>
                                            Текст
                                        </button>
                                    )}
                                    {canAddTimer && (
                                        <button type="button" className="fb-chip" onClick={() => { update(station.key, { timer: "" }); setFieldMenuFor(null); }}>
                                            Секундомер
                                        </button>
                                    )}
                                    <button type="button" className="fb-chip" onClick={() => setFieldMenuFor(null)}>
                                        Отмена
                                    </button>
                                </div>
                            ) : (
                                <button type="button" className="fb-circuit__add-field" onClick={() => setFieldMenuFor(station.key)}>
                                    + поле
                                </button>
                            )
                        )}
                    </div>
                );
            })}

            <button type="button" className="fb-add-link" onClick={() => onChange([...stations, newStation()])}>
                + Добавить упражнение
            </button>
        </div>
    );
}
