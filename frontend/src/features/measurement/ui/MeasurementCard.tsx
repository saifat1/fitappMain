import { MEASUREMENT_FIELDS } from "../model/measurement.types";
import type { ClientMeasurementResponse } from "../model/measurement.types";

type Props = {
    measurement: ClientMeasurementResponse;
    previous?: ClientMeasurementResponse;
    onEdit?: () => void;
    onDelete?: () => void;
};

function formatDate(dateKey: string): string {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function MeasurementCard({ measurement, previous, onEdit, onDelete }: Props) {
    const filledFields = MEASUREMENT_FIELDS.filter((field) => measurement[field.key] != null);

    return (
        <div className="fb-measurement-card">
            <div className="fb-measurement-card__header">
                <span className="fb-measurement-card__date">{formatDate(measurement.measuredAt)}</span>
                {(onEdit || onDelete) && (
                    <div className="fb-measurement-card__actions">
                        {onEdit && (
                            <button type="button" className="fb-measurement-card__link" onClick={onEdit}>
                                Изменить
                            </button>
                        )}
                        {onDelete && (
                            <button
                                type="button"
                                className="fb-measurement-card__link fb-measurement-card__link--danger"
                                onClick={onDelete}
                            >
                                Удалить
                            </button>
                        )}
                    </div>
                )}
            </div>

            {filledFields.length === 0 ? (
                <div className="fb-empty">Значения не указаны</div>
            ) : (
                <div className="fb-measurement-card__grid">
                    {filledFields.map((field) => {
                        const value = measurement[field.key] as number;
                        const previousValue = previous?.[field.key] as number | null | undefined;
                        const delta =
                            previousValue != null ? Math.round((value - previousValue) * 10) / 10 : null;

                        return (
                            <div key={field.key} className="fb-measurement-card__row">
                                <span className="fb-measurement-card__label">{field.label}</span>
                                <span className="fb-measurement-card__value">
                                    {value}
                                    {delta != null && delta !== 0 ? (
                                        <span
                                            className={`fb-measurement-card__delta ${
                                                delta > 0 ? "fb-measurement-card__delta--up" : "fb-measurement-card__delta--down"
                                            }`}
                                        >
                                            {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}
                                        </span>
                                    ) : delta === 0 ? (
                                        <span className="fb-measurement-card__delta">без изменений</span>
                                    ) : null}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {measurement.notes ? (
                <div className="fb-measurement-card__notes">{measurement.notes}</div>
            ) : null}
        </div>
    );
}
