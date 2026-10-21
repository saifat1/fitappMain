import { useState } from "react";
import { newField, type CircuitFieldType, type CircuitStation } from "../model/circuit";

type Props = {
    station: CircuitStation;
    number: number;
    onChange: (station: CircuitStation) => void;
    /** Omit to hide the "×" next to the title. */
    onRemove?: () => void;
};

const FIELD_LABEL: Record<CircuitFieldType, string> = {
    TEXT: "Текст",
    TIMER: "Секундомер",
};

/** One circuit station: numbered title plus any number of "Текст" / "Секундомер" fields, added via "+ поле". */
export default function CircuitStationEditor({ station, number, onChange, onRemove }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);

    const updateField = (key: string, value: string) => {
        onChange({ ...station, fields: station.fields.map((f) => (f.key === key ? { ...f, value } : f)) });
    };

    const removeField = (key: string) => {
        onChange({ ...station, fields: station.fields.filter((f) => f.key !== key) });
    };

    const addField = (type: CircuitFieldType) => {
        onChange({ ...station, fields: [...station.fields, newField(type)] });
        setMenuOpen(false);
    };

    return (
        <div className="fb-circuit__station">
            <div className="fb-circuit__head">
                <span className="fb-circuit__num">{number}</span>
                <input
                    className="fb-circuit__input fb-circuit__input--title"
                    placeholder="Название упражнения"
                    aria-label={`Название упражнения ${number}`}
                    value={station.title}
                    onChange={(e) => onChange({ ...station, title: e.target.value })}
                />
                {onRemove && (
                    <button type="button" className="fb-row__remove" aria-label={`Убрать упражнение ${number}`} onClick={onRemove}>
                        ×
                    </button>
                )}
            </div>

            {station.fields.map((field) => (
                <div key={field.key} className="fb-circuit__field">
                    <span className="fb-circuit__label">{FIELD_LABEL[field.type]}</span>
                    {field.type === "TEXT" ? (
                        <textarea
                            className="fb-circuit__input"
                            rows={2}
                            aria-label={`Текст, упражнение ${number}`}
                            value={field.value}
                            onChange={(e) => updateField(field.key, e.target.value)}
                        />
                    ) : (
                        <input
                            className="fb-circuit__input fb-circuit__input--timer"
                            inputMode="numeric"
                            placeholder="мм:сс"
                            aria-label={`Секундомер, упражнение ${number}`}
                            value={field.value}
                            onChange={(e) => updateField(field.key, e.target.value)}
                        />
                    )}
                    <button
                        type="button"
                        className="fb-row__remove"
                        aria-label={`Убрать поле «${FIELD_LABEL[field.type]}»`}
                        onClick={() => removeField(field.key)}
                    >
                        ×
                    </button>
                </div>
            ))}

            {menuOpen ? (
                <div className="fb-chips fb-chips--wrap fb-circuit__menu">
                    <button type="button" className="fb-chip" onClick={() => addField("TEXT")}>
                        Текст
                    </button>
                    <button type="button" className="fb-chip" onClick={() => addField("TIMER")}>
                        Секундомер
                    </button>
                    <button type="button" className="fb-chip" onClick={() => setMenuOpen(false)}>
                        Отмена
                    </button>
                </div>
            ) : (
                <button type="button" className="fb-circuit__add-field" onClick={() => setMenuOpen(true)}>
                    + поле
                </button>
            )}
        </div>
    );
}
