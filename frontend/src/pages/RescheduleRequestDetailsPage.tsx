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
                if (axios.isAxiosError<ApiErrorResponse>(error)) {
                    setErrorMessage(
                        error.response?.data?.message ?? "Не удалось загрузить запрос"
                    );
                } else {
                    setErrorMessage("Неизвестная ошибка");
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadRequest();
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
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? "Не удалось обработать запрос"
                );
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
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
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? "Не удалось отменить запрос"
                );
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="reschedule-page">
                <section className="reschedule-panel">
                    <p>Загрузка...</p>
                </section>
            </div>
        );
    }

    if (errorMessage && !request) {
        return (
            <div className="reschedule-page">
                <section className="reschedule-panel">
                    <div className="error-box">{errorMessage}</div>
                    <div className="details-actions top-gap">
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => navigate("/reschedule-requests")}
                        >
                            Назад к запросам
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="reschedule-page">
                <section className="reschedule-panel">
                    <p>Запрос не найден.</p>
                    <div className="details-actions top-gap">
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => navigate("/reschedule-requests")}
                        >
                            Назад к запросам
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    const isPending = request.status === "PENDING";

    return (
        <div className="reschedule-page">
            <section className="reschedule-details-hero">
                <div className="reschedule-details-hero-main">
                    <div className="reschedule-kicker">Запрос #{request.id}</div>
                    <h1 className="reschedule-title">Перенос тренировки #{request.trainingId}</h1>
                    <p className="reschedule-subtitle">
                        Запрошенная дата: {request.requestedTrainingDate} ·{" "}
                        {formatTimeRange(request.requestedStartTime, request.requestedEndTime)}
                    </p>

                    <div className="training-details-hero-actions">
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => navigate("/reschedule-requests")}
                        >
                            Назад к запросам
                        </button>
                    </div>
                </div>

                <div className="reschedule-details-summary">
                    <div className="training-details-summary-top">
            <span className={getRequestStatusClass(request.status)}>
              {getRequestStatusLabel(request.status)}
            </span>
                    </div>

                    <div className="training-meta-grid">
                        <div className="training-meta-item">
                            <span>Training ID</span>
                            <strong>{request.trainingId}</strong>
                        </div>
                        <div className="training-meta-item">
                            <span>Requester</span>
                            <strong>{request.requesterEmail}</strong>
                        </div>
                        <div className="training-meta-item">
                            <span>Создан</span>
                            <strong>{new Date(request.createdAt).toLocaleString()}</strong>
                        </div>
                        <div className="training-meta-item">
                            <span>Обновлён</span>
                            <strong>{new Date(request.updatedAt).toLocaleString()}</strong>
                        </div>
                    </div>
                </div>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <section className="training-details-grid">
                <div className="reschedule-panel">
                    <div className="reschedule-panel-header">
                        <div>
                            <div className="reschedule-panel-kicker">Содержание</div>
                            <h2 className="reschedule-panel-title">Детали запроса</h2>
                        </div>
                    </div>

                    <div className="training-meta-grid">
                        <div className="training-meta-item">
                            <span>Запрошенная дата</span>
                            <strong>{request.requestedTrainingDate}</strong>
                        </div>
                        <div className="training-meta-item">
                            <span>Запрошенное время</span>
                            <strong>{formatTimeRange(request.requestedStartTime, request.requestedEndTime)}</strong>
                        </div>
                        <div className="training-meta-item training-meta-item-wide">
                            <span>Комментарий клиента</span>
                            <strong>{request.clientComment ?? "Нет комментария"}</strong>
                        </div>
                        <div className="training-meta-item training-meta-item-wide">
                            <span>Комментарий тренера</span>
                            <strong>{request.trainerComment ?? "Нет комментария"}</strong>
                        </div>
                        <div className="training-meta-item">
                            <span>Обработан</span>
                            <strong>
                                {request.processedAt
                                    ? new Date(request.processedAt).toLocaleString()
                                    : "Ещё не обработан"}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="reschedule-panel">
                    <div className="reschedule-panel-header">
                        <div>
                            <div className="reschedule-panel-kicker">Действия</div>
                            <h2 className="reschedule-panel-title">Работа с запросом</h2>
                        </div>
                    </div>

                    {isTrainer && isPending ? (
                        <div className="trainings-form">
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

                            <div className="details-actions">
                                <button
                                    type="button"
                                    className="dashboard-btn dashboard-btn-primary"
                                    onClick={() => handleProcess("APPROVED")}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "Обрабатываем..." : "Подтвердить перенос"}
                                </button>

                                <button
                                    type="button"
                                    className="dashboard-btn dashboard-btn-secondary"
                                    onClick={() => handleProcess("REJECTED")}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? "Обрабатываем..." : "Отклонить"}
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {isClient && isPending ? (
                        <div className="details-actions">
                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary"
                                onClick={handleCancel}
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
                </div>
            </section>
        </div>
    );
}