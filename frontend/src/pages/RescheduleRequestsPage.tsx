import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../features/auth/model/AuthContext";
import { rescheduleApi } from "../shared/api/rescheduleApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { RescheduleRequestResponse } from "../features/reschedule/model/reschedule.types";

function formatTimeRange(
    startTime: string | null,
    endTime: string | null
): string {
    if (!startTime && !endTime) {
        return "-";
    }

    if (startTime && endTime) {
        return `${startTime} - ${endTime}`;
    }

    return startTime ?? endTime ?? "-";
}

export default function RescheduleRequestsPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [requests, setRequests] = useState<RescheduleRequestResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const isTrainer = currentUser?.role === "TRAINER";

    async function loadRequests() {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await rescheduleApi.getRequests();
            setRequests(data);
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? "Не удалось загрузить запросы"
                );
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadRequests();
    }, []);

    return (
        <div className="page-card page-card-wide">
            <div className="page-header-row">
                <div>
                    <h2>Запросы на перенос</h2>
                    <p className="page-description">
                        {isTrainer
                            ? "Запросы клиентов на перенос тренировок."
                            : "Твои запросы на перенос тренировок."}
                    </p>
                </div>

                <button onClick={loadRequests} disabled={isLoading}>
                    {isLoading ? "Обновляем..." : "Обновить"}
                </button>
            </div>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            {isLoading && <p>Загрузка...</p>}

            {!isLoading && !errorMessage && requests.length === 0 && (
                <p>Запросов пока нет.</p>
            )}

            {!isLoading && !errorMessage && requests.length > 0 && (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Training ID</th>
                            <th>Запрошенная дата</th>
                            <th>Запрошенное время</th>
                            <th>Статус</th>
                            {isTrainer && <th>Кто запросил</th>}
                            <th>Комментарий клиента</th>
                            <th>Комментарий тренера</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.trainingId}</td>
                                <td>{item.requestedTrainingDate}</td>
                                <td>
                                    {formatTimeRange(
                                        item.requestedStartTime,
                                        item.requestedEndTime
                                    )}
                                </td>
                                <td>{item.status}</td>
                                {isTrainer && <td>{item.requesterEmail}</td>}
                                <td>{item.clientComment ?? "-"}</td>
                                <td>{item.trainerComment ?? "-"}</td>
                                <td>
                                    <button
                                        onClick={() => navigate(`/reschedule-requests/${item.id}`)}
                                    >
                                        Открыть
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}