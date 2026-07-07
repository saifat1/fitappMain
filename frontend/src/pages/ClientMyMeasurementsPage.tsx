import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { measurementApi } from "../shared/api/measurementApi";
import MeasurementCard from "../features/measurement/ui/MeasurementCard";
import type { ClientMeasurementResponse } from "../features/measurement/model/measurement.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ClientMyMeasurementsPage() {
    const navigate = useNavigate();
    const [measurements, setMeasurements] = useState<ClientMeasurementResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let active = true;
        measurementApi
            .getMy()
            .then((data) => active && setMeasurements(data))
            .catch((error) => active && setErrorMessage(resolveApiError(error, "Не удалось загрузить измерения")))
            .finally(() => active && setIsLoading(false));
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">Мои измерения</h1>
            </header>

            <div className="fb-body">
                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : errorMessage ? (
                    <div className="fb-cal-error">{errorMessage}</div>
                ) : measurements.length === 0 ? (
                    <div className="fb-empty">Замеров пока нет</div>
                ) : (
                    measurements.map((measurement, index) => (
                        <MeasurementCard
                            key={measurement.id}
                            measurement={measurement}
                            previous={measurements[index + 1]}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
