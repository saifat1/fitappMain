import { useEffect, useMemo, useState } from "react";
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
        return "Время не указано";
    }

    if (startTime && endTime) {
        return `${startTime} - ${endTime}`;
    }

    return startTime ?? endTime ?? "Время не указано";
}

function getRequestStatusLabel(status: string): string {
    switch (status) {
        case "PENDING":
            return "Ожидает решения";
        case "APPROVED":
            return "Подтверждён";
        case "REJECTED":
            return "Отклонён";
        case "CANCELLED":
            return "Отменён";
        default:
            return status;
    }
}

function getRequestStatusClass(status: string): string {
    switch (status) {
        case "PENDING":
            return "reschedule-status-badge pending";
        case "APPROVED":
            return "reschedule-status-badge approved";
        case "REJECTED":
            return "reschedule-status-badge rejected";
        case "CANCELLED":
            return "reschedule-status-badge cancelled";
        default:
            return "reschedule-status-badge";
    }
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

    const stats = useMemo(() => {
        const pending = requests.filter((item) => item.status === "PENDING").length;
        const approved = requests.filter((item) => item.status === "APPROVED").length;
        const rejected = requests.filter((item) => item.status === "REJECTED").length;
        const cancelled = requests.filter((item) => item.status === "CANCELLED").length;

        return {
            total: requests.length,
            pending,
            approved,
            rejected,
            cancelled,
        };
    }, [requests]);

    return (
        <div className="reschedule-page">
            <section className="reschedule-hero">
                <div className="reschedule-hero-main">
                    <div className="reschedule-kicker">Переносы</div>
                    <h1 className="reschedule-title">
                        {isTrainer ? "Запросы на перенос тренировок" : "Мои запросы на перенос"}
                    </h1>
                    <p className="reschedule-subtitle">
                        {isTrainer
                            ? "Смотри новые обращения клиентов, быстро выделяй pending-запросы и переходи к принятию решения."
                            : "Смотри свои запросы на перенос, отслеживай статусы и открывай детали каждого обращения."}
                    </p>
                </div>

                <div className="reschedule-hero-stats">
                    <div className="reschedule-stat-card">
                        <span>Всего</span>
                        <strong>{stats.total}</strong>
                    </div>
                    <div className="reschedule-stat-card">
                        <span>Ожидают решения</span>
                        <strong>{stats.pending}</strong>
                    </div>
                    <div className="reschedule-stat-card">
                        <span>Подтверждены</span>
                        <strong>{stats.approved}</strong>
                    </div>
                    <div className="reschedule-stat-card">
                        <span>Отклонены / отменены</span>
                        <strong>{stats.rejected + stats.cancelled}</strong>
                    </div>
                </div>
            </section>

            <section className="reschedule-panel">
                <div className="reschedule-panel-header">
                    <div>
                        <div className="reschedule-panel-kicker">Список</div>
                        <h2 className="reschedule-panel-title">Все запросы</h2>
                    </div>

                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary"
                        onClick={loadRequests}
                        disabled={isLoading}
                    >
                        {isLoading ? "Обновляем..." : "Обновить"}
                    </button>
                </div>

                {errorMessage && <div className="error-box">{errorMessage}</div>}

                {isLoading && <p>Загрузка...</p>}

                {!isLoading && !errorMessage && requests.length === 0 && (
                    <div className="reschedule-empty">
                        <div className="reschedule-empty-title">Запросов пока нет</div>
                        <div className="reschedule-empty-text">
                            Здесь появятся запросы на перенос тренировок.
                        </div>
                    </div>
                )}

                {!isLoading && !errorMessage && requests.length > 0 && (
                    <div className="reschedule-list">
                        {requests.map((item) => (
                            <article
                                key={item.id}
                                className={
                                    item.status === "PENDING"
                                        ? "reschedule-card reschedule-card-pending"
                                        : "reschedule-card"
                                }
                            >
                                <div className="reschedule-card-top">
                                    <div>
                                        <div className="reschedule-card-kicker">
                                            Запрос #{item.id} · Тренировка #{item.trainingId}
                                        </div>
                                        <h3 className="reschedule-card-title">
                                            {item.requestedTrainingDate}
                                        </h3>
                                        <div className="reschedule-card-time">
                                            {formatTimeRange(item.requestedStartTime, item.requestedEndTime)}
                                        </div>
                                    </div>

                                    <span className={getRequestStatusClass(item.status)}>
                    {getRequestStatusLabel(item.status)}
                  </span>
                                </div>

                                <div className="reschedule-card-grid">
                                    {isTrainer && (
                                        <div className="reschedule-card-item">
                                            <span>Кто запросил</span>
                                            <strong>{item.requesterEmail}</strong>
                                        </div>
                                    )}

                                    <div className="reschedule-card-item">
                                        <span>Комментарий клиента</span>
                                        <strong>{item.clientComment?.trim() ? item.clientComment : "Нет комментария"}</strong>
                                    </div>

                                    <div className="reschedule-card-item">
                                        <span>Комментарий тренера</span>
                                        <strong>{item.trainerComment?.trim() ? item.trainerComment : "Нет комментария"}</strong>
                                    </div>
                                </div>

                                <div className="reschedule-card-actions">
                                    <button
                                        type="button"
                                        className="dashboard-btn dashboard-btn-primary"
                                        onClick={() => navigate(`/reschedule-requests/${item.id}`)}
                                    >
                                        Открыть
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}