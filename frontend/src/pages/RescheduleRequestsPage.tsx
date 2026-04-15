import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../features/auth/model/AuthContext";
import { rescheduleApi } from "../shared/api/rescheduleApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { RescheduleRequestResponse } from "../features/reschedule/model/reschedule.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function formatTimeRange(startTime: string | null, endTime: string | null): string {
    if (!startTime && !endTime) {
        return "Время не указано";
    }

    if (startTime && endTime) {
        return `${startTime}–${endTime}`;
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

function formatCreatedAt(value: string): string {
    return new Date(value).toLocaleDateString();
}

export default function RescheduleRequestsPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isTrainer = currentUser?.role === "TRAINER";

    const [requests, setRequests] = useState<RescheduleRequestResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    async function loadRequests() {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await rescheduleApi.getRequests();
            setRequests(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить запросы"));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadRequests();
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
        <div className="reschedule-page reschedule-page-compact entity-page-compact">
            <section className="reschedule-header-bar entity-header-bar">
                <div className="reschedule-header-main entity-header-main">
                    <h1 className="reschedule-header-title entity-header-title">Переносы</h1>

                    <div className="reschedule-summary-row entity-summary-row">
            <span className="reschedule-summary-chip entity-summary-chip">
              <strong>{stats.total}</strong>
              <span>Всего</span>
            </span>

                        <span className="reschedule-summary-chip pending entity-summary-chip entity-summary-chip--info">
              <strong>{stats.pending}</strong>
              <span>Ожидают</span>
            </span>

                        <span className="reschedule-summary-chip approved entity-summary-chip entity-summary-chip--positive">
              <strong>{stats.approved}</strong>
              <span>Подтверждены</span>
            </span>

                        <span className="reschedule-summary-chip muted entity-summary-chip entity-summary-chip--muted">
              <strong>{stats.rejected + stats.cancelled}</strong>
              <span>Архив</span>
            </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary reschedule-refresh-btn entity-header-action"
                    onClick={() => void loadRequests()}
                    disabled={isLoading}
                >
                    {isLoading ? "Обновляем..." : "Обновить"}
                </button>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <section className="reschedule-panel reschedule-panel-compact entity-panel-compact">
                <div className="reschedule-section-head entity-section-head">
                    <h2 className="reschedule-section-title entity-section-title">
                        {isTrainer ? "Все запросы" : "Мои запросы"}
                    </h2>
                    <span className="reschedule-section-count entity-section-count">{requests.length}</span>
                </div>

                {isLoading ? (
                    <div className="reschedule-empty-text">Загрузка...</div>
                ) : requests.length === 0 ? (
                    <div className="reschedule-empty">
                        <div className="reschedule-empty-title">Запросов пока нет</div>
                        <div className="reschedule-empty-text">
                            Здесь появятся запросы на перенос тренировок.
                        </div>
                    </div>
                ) : (
                    <section className="reschedule-list reschedule-list-compact entity-list-compact">
                        {requests.map((item) => (
                            <article
                                key={item.id}
                                className={`reschedule-card reschedule-card-compact entity-card-compact ${
                                    item.status === "PENDING" ? "reschedule-card-pending" : ""
                                }`}
                            >
                                <div className="reschedule-card-row entity-card-row">
                                    <div className="reschedule-card-main-compact entity-card-main">
                                        <div className="reschedule-card-title-row entity-title-row">
                                            <div className="reschedule-card-title-compact entity-title">
                                                {item.requestedTrainingDate} · {formatTimeRange(item.requestedStartTime, item.requestedEndTime)}
                                            </div>
                                            <div className={getRequestStatusClass(item.status)}>
                                                {getRequestStatusLabel(item.status)}
                                            </div>
                                        </div>

                                        <div className="reschedule-card-meta-row entity-meta-row">
                                            <span>Запрос #{item.id}</span>
                                            <span>Тренировка #{item.trainingId}</span>
                                            <span>Создан {formatCreatedAt(item.createdAt)}</span>
                                            {isTrainer && <span>Клиент {item.requesterEmail}</span>}
                                        </div>

                                        <div className="reschedule-inline-notes">
                                            <div className="reschedule-inline-note">
                                                <span>Комментарий клиента</span>
                                                <strong>
                                                    {item.clientComment?.trim() ? item.clientComment : "Нет комментария"}
                                                </strong>
                                            </div>

                                            <div className="reschedule-inline-note">
                                                <span>Комментарий тренера</span>
                                                <strong>
                                                    {item.trainerComment?.trim() ? item.trainerComment : "Нет комментария"}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="reschedule-card-actions reschedule-card-actions-compact entity-actions-compact">
                                        <button
                                            type="button"
                                            className="dashboard-btn dashboard-btn-secondary reschedule-action-btn entity-secondary-btn"
                                            onClick={() => navigate(`/reschedule-requests/${item.id}`)}
                                        >
                                            Открыть
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </section>
        </div>
    );
}