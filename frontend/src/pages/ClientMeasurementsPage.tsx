import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { measurementApi } from "../shared/api/measurementApi";
import MeasurementCard from "../features/measurement/ui/MeasurementCard";
import MeasurementFormSheet from "../features/measurement/ui/MeasurementFormSheet";
import type { ClientMeasurementResponse, SaveClientMeasurementRequest } from "../features/measurement/model/measurement.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ClientMeasurementsPage() {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();
    const id = Number(clientId);

    const [measurements, setMeasurements] = useState<ClientMeasurementResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [sheetState, setSheetState] = useState<{ editing?: ClientMeasurementResponse } | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await measurementApi.getForClient(id);
            setMeasurements(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить замеры"));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    const closeSheet = () => setSheetState(null);

    const handleSubmit = async (payload: SaveClientMeasurementRequest) => {
        setIsSaving(true);
        setErrorMessage("");
        try {
            if (sheetState?.editing) {
                await measurementApi.update(id, sheetState.editing.id, payload);
            } else {
                await measurementApi.create(id, payload);
            }
            closeSheet();
            await load();
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось сохранить замер"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (measurement: ClientMeasurementResponse) => {
        if (!window.confirm("Удалить этот замер?")) return;
        try {
            await measurementApi.remove(id, measurement.id);
            await load();
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось удалить замер"));
        }
    };

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">Измерения</h1>
            </header>

            <div className="fb-body">
                <button
                    type="button"
                    className="fb-btn fb-btn--ghost"
                    onClick={() => setSheetState({})}
                >
                    + Новый замер
                </button>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : measurements.length === 0 ? (
                    <div className="fb-empty">Замеров пока нет</div>
                ) : (
                    <div style={{ marginTop: 12 }}>
                        {measurements.map((measurement, index) => (
                            <MeasurementCard
                                key={measurement.id}
                                measurement={measurement}
                                previous={measurements[index + 1]}
                                onEdit={() => setSheetState({ editing: measurement })}
                                onDelete={() => handleDelete(measurement)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {sheetState ? (
                <MeasurementFormSheet
                    initial={sheetState.editing}
                    isSaving={isSaving}
                    errorMessage={errorMessage || undefined}
                    onSubmit={handleSubmit}
                    onClose={closeSheet}
                />
            ) : null}
        </div>
    );
}
