import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../features/auth/model/AuthContext";
import { rescheduleApi } from "../shared/api/rescheduleApi";

import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    ProcessRescheduleRequestRequest,
    RescheduleRequestResponse,
} from "../features/reschedule/model/reschedule.types";

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

function formatDateTime(value: string | null): string {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleString();
}

export default function RescheduleRequestDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [request, setRequest] = useState<RescheduleRequestResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [trainerComment, setTrainerComment] = useState("");

    const isTrainer = currentUser?.role === "TRAINER";
    const isClient = currentUser?.role === "CLIENT";

    useEffect(() => {
        async function loadRequest() {
            if (!id) {
                setErrorMessage("Не указан id запроса");
                setIsLoading(false);
                return;
            }

            setErrorMessage("");
            setIsLoading(true);

            try {
                const data = await rescheduleApi.getRequest(Number(id));
                setRequest(data);
                setTrainerComment(data.trainerComment ?? "");
            } catch (error) {
                setErrorMessage(resolveApiError(error, "Не удалось загрузить запрос"));
            } finally {
                setIsLoading(false);
            }
        }

        void loadRequest();
    }, [id]);

    const handleProcess = async (decision: "APPROVED" | "REJECTED") => {
        if (!id || !request) {
            return;
        }

        setErrorMessage("");
        setIsProcessing(true);

        const payload: ProcessRescheduleRequestRequest = {
            decision,
            trainerComment: trainerComment.trim() || undefined,
        };

        try {
            const updated = await rescheduleApi.processRequest(Number(id), payload);
            setRequest(updated);
            setTrainerComment(updated.trainerComment ?? "");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось обработать запрос"));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!id || !request) {
            return;
        }

        const confirmed = window.confirm("Отменить запрос на перенос?");
        if (!confirmed) {
            return;
        }

        setErrorMessage("");
        setIsCancelling(true);

        try {
            await rescheduleApi.cancelRequest(Number(id));
            const updated = await rescheduleApi.getRequest(Number(id));
            setRequest(updated);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось отменить запрос"));
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="reschedule-details-page reschedule-details-page-compact entity-page-compact">
                <section className="reschedule-details-panel reschedule-details-panel-compact entity-panel-compact">
                    <div className="reschedule-empty-text">Загрузка...</div>
                </section>
            </div>
        );
    }

    if (errorMessage && !request) {
        return (
            <div className="reschedule-details-page reschedule-details-page-compact entity-page-compact">
                <div className="error-box">{errorMessage}</div>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary"
                    onClick={() => navigate("/reschedule-requests")}
                >
                    Назад к запросам
                </button>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="reschedule-details-page reschedule-details-page-compact entity-page-compact">
                <section className="reschedule-details-panel reschedule-details-panel-compact entity-panel-compact">
                    <div className="reschedule-empty-title">Запрос не найден</div>
                    <div className="reschedule-empty-text">
                        Возможно, он был удалён или недоступен текущему пользователю.
                    </div>
                </section>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary"
                    onClick={() => navigate("/reschedule-requests")}
                >
                    Назад к запросам
                </button>
            </div>
        );
    }

    const isPending = request.status === "PENDING";

    return (
        <div className="reschedule-details-page reschedule-details-page-compact entity-page-compact">
            <section className="reschedule-details-header-bar entity-header-bar">
                <div className="reschedule-details-header-main entity-header-main">
                    <h1 className="reschedule-details-header-title entity-header-title">
                        Запрос #{request.id}
                    </h1>

                    <div className="reschedule-details-summary-row entity-summary-row">
            <span className="entity-summary-chip">
              <strong>#{request.trainingId}</strong>
              <span>Тренировка</span>
            </span>

                        <span className="entity-summary-chip entity-summary-chip--info">
              <strong>{request.requestedTrainingDate}</strong>
              <span>{formatTimeRange(request.requestedStartTime, request.requestedEndTime)}</span>
            </span>

                        <span className={getRequestStatusClass(request.status)}>
              {getRequestStatusLabel(request.status)}
            </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary entity-header-action"
                    onClick={() => navigate("/reschedule-requests")}
                >
                    Назад
                </button>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <section className="reschedule-details-panel reschedule-details-panel-compact entity-panel-compact">
                <div className="reschedule-details-section-head entity-section-head">
                    <h2 className="reschedule-details-section-title entity-section-title">Детали запроса</h2>
                </div>

                <div className="reschedule-details-grid-compact">
                    <div className="reschedule-details-item">
                        <span>Запрошенная дата</span>
                        <strong>{request.requestedTrainingDate}</strong>
                    </div>

                    <div className="reschedule-details-item">
                        <span>Запрошенное время</span>
                        <strong>{formatTimeRange(request.requestedStartTime, request.requestedEndTime)}</strong>
                    </div>

                    <div className="reschedule-details-item">
                        <span>Отправитель</span>
                        <strong>{request.requesterEmail}</strong>
                    </div>

                    <div className="reschedule-details-item">
                        <span>Создан</span>
                        <strong>{formatDateTime(request.createdAt)}</strong>
                    </div>

                    <div className="reschedule-details-item">
                        <span>Обновлён</span>
                        <strong>{formatDateTime(request.updatedAt)}</strong>
                    </div>

                    <div className="reschedule-details-item">
                        <span>Обработан</span>
                        <strong>{formatDateTime(request.processedAt)}</strong>
                    </div>
                </div>

                <div className="reschedule-details-notes">
                    <div className="reschedule-inline-note">
                        <span>Комментарий клиента</span>
                        <strong>{request.clientComment?.trim() ? request.clientComment : "Нет комментария"}</strong>
                    </div>

                    <div className="reschedule-inline-note">
                        <span>Комментарий тренера</span>
                        <strong>{request.trainerComment?.trim() ? request.trainerComment : "Нет комментария"}</strong>
                    </div>
                </div>
            </section>

            <section className="reschedule-details-panel reschedule-details-panel-compact entity-panel-compact">
                <div className="reschedule-details-section-head entity-section-head">
                    <h2 className="reschedule-details-section-title entity-section-title">Действия</h2>
                </div>

                {isTrainer && isPending ? (
                    <div className="reschedule-details-action-block">
                        <div className="form-row">
                            <label htmlFor="trainer-comment">Комментарий тренера</label>
                            <textarea
                                id="trainer-comment"
                                value={trainerComment}
                                onChange={(event) => setTrainerComment(event.target.value)}
                                rows={5}
                                placeholder="Добавь пояснение к решению, если это нужно"
                            />
                        </div>

                        <div className="reschedule-details-actions">
                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-primary"
                                onClick={() => void handleProcess("APPROVED")}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Обрабатываем..." : "Подтвердить"}
                            </button>

                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary"
                                onClick={() => void handleProcess("REJECTED")}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Обрабатываем..." : "Отклонить"}
                            </button>
                        </div>
                    </div>
                ) : null}

                {isClient && isPending ? (
                    <div className="reschedule-details-actions">
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => void handleCancel()}
                            disabled={isCancelling}
                        >
                            {isCancelling ? "Отменяем..." : "Отменить запрос"}
                        </button>
                    </div>
                ) : null}

                {!isPending && (
                    <div className="reschedule-note-box">
                        <div className="reschedule-note-box-title">Статус финализирован</div>
                        <div className="reschedule-note-box-text">
                            Для этого запроса дополнительные действия сейчас не требуются.
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}