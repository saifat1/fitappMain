import { useState } from "react";
import { MEASUREMENT_FIELDS } from "../model/measurement.types";
import type { ClientMeasurementResponse, SaveClientMeasurementRequest } from "../model/measurement.types";

type Props = {
    initial?: ClientMeasurementResponse;
    isSaving: boolean;
    errorMessage?: string;
    onSubmit: (payload: SaveClientMeasurementRequest) => void;
    onClose: () => void;
};

function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

export default function MeasurementFormSheet({ initial, isSaving, errorMessage, onSubmit, onClose }: Props) {
    const [measuredAt, setMeasuredAt] = useState(initial?.measuredAt ?? todayIso());
    const [values, setValues] = useState<Record<string, string>>(() => {
        const initialValues: Record<string, string> = {};
        for (const field of MEASUREMENT_FIELDS) {
            const value = initial?.[field.key];
            initialValues[field.key] = value != null ? String(value) : "";
        }
        return initialValues;
    });
    const [notes, setNotes] = useState(initial?.notes ?? "");

    const handleSubmit = () => {
        const payload: SaveClientMeasurementRequest = { measuredAt, notes: notes.trim() || undefined };
        for (const field of MEASUREMENT_FIELDS) {
            const raw = values[field.key];
            (payload as Record<string, unknown>)[field.key] = raw ? Number(raw) : undefined;
        }
        onSubmit(payload);
    };

    return (
        <>
            <button type="button" className="fb-overlay" aria-label="Закрыть" onClick={onClose} />

            <div className="fb-add-sheet fb-measurement-sheet" role="dialog" aria-label="Замер">
                <div className="fb-add-sheet__handle" />
                <h3 className="fb-add-sheet__title">{initial ? "Редактировать замер" : "Новый замер"}</h3>

                <div className="fb-add-sheet__row">
                    <label className="fb-add-sheet__label" htmlFor="m-date">
                        Дата
                    </label>
                    <input
                        id="m-date"
                        type="date"
                        className="fb-add-sheet__select"
                        style={{ width: "auto", maxWidth: "none", flex: 1 }}
                        value={measuredAt}
                        onChange={(event) => setMeasuredAt(event.target.value)}
                    />
                </div>

                {MEASUREMENT_FIELDS.map((field) => (
                    <div className="fb-add-sheet__row" key={field.key}>
                        <label className="fb-add-sheet__label" htmlFor={`m-${field.key}`}>
                            {field.label}
                        </label>
                        <input
                            id={`m-${field.key}`}
                            type="number"
                            step="0.1"
                            className="fb-add-sheet__select"
                            style={{ width: "auto", maxWidth: "none", flex: 1 }}
                            value={values[field.key] ?? ""}
                            onChange={(event) =>
                                setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                            }
                        />
                    </div>
                ))}

                <div className="fb-add-sheet__row">
                    <label className="fb-add-sheet__label" htmlFor="m-notes">
                        Для заметок
                    </label>
                    <input
                        id="m-notes"
                        type="text"
                        className="fb-add-sheet__select"
                        style={{ width: "auto", maxWidth: "none", flex: 1 }}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                    />
                </div>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                <div className="fb-add-sheet__actions">
                    <button type="button" className="fb-btn fb-btn--ghost" onClick={onClose} disabled={isSaving}>
                        Отмена
                    </button>
                    <button type="button" className="fb-btn fb-btn--primary" onClick={handleSubmit} disabled={isSaving}>
                        {isSaving ? "Сохраняем…" : "Сохранить"}
                    </button>
                </div>
            </div>
        </>
    );
}
