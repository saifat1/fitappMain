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
        return "-";
    }

    if (startTime && endTime) {
        return `${startTime} - ${endTime}`;
    }

    return startTime ?? endTime ?? "-";
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
            <div className="page-card">
                <p>Загрузка...</p>
            </div>
        );
    }

    if (errorMessage && !request) {
        return (
            <div className="page-card">
                <div className="error-box">{errorMessage}</div>
                <button onClick={() => navigate("/reschedule-requests")}>
                    Назад к запросам
                </button>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="page-card">
                <p>Запрос не найден.</p>
                <button onClick={() => navigate("/reschedule-requests")}>
                    Назад к запросам
                </button>
            </div>
        );
    }

    const isPending = request.status === "PENDING";

    return (
        <div className="page-card page-card-wide">
            <div className="page-header-row">
                <div>
                    <h2>Запрос на перенос #{request.id}</h2>
                    <p className="page-description">
                        Training ID: {request.trainingId}
                    </p>
                </div>

                <button onClick={() => navigate("/reschedule-requests")}>
                    Назад к запросам
                </button>
            </div>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <div className="details-grid">
                <div><strong>Training ID:</strong> {request.trainingId}</div>
                <div><strong>Requester:</strong> {request.requesterEmail}</div>
                <div><strong>Запрошенная дата:</strong> {request.requestedTrainingDate}</div>
                <div>
                    <strong>Запрошенное время:</strong>{" "}
                    {formatTimeRange(request.requestedStartTime, request.requestedEndTime)}
                </div>
                <div><strong>Статус:</strong> {request.status}</div>
                <div><strong>Комментарий клиента:</strong> {request.clientComment ?? "-"}</div>
                <div><strong>Комментарий тренера:</strong> {request.trainerComment ?? "-"}</div>
                <div>
                    <strong>Обработан:</strong>{" "}
                    {request.processedAt ? new Date(request.processedAt).toLocaleString() : "-"}
                </div>
                <div>
                    <strong>Создан:</strong> {new Date(request.createdAt).toLocaleString()}
                </div>
                <div>
                    <strong>Обновлён:</strong> {new Date(request.updatedAt).toLocaleString()}
                </div>
            </div>

            {isTrainer && isPending && (
                <div className="top-gap">
                    <div className="form-row">
                        <label htmlFor="trainer-comment">Комментарий тренера</label>
                        <textarea
                            id="trainer-comment"
                            value={trainerComment}
                            onChange={(event) => setTrainerComment(event.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="details-actions top-gap">
                        <button
                            onClick={() => handleProcess("APPROVED")}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Обрабатываем..." : "Подтвердить перенос"}
                        </button>

                        <button
                            onClick={() => handleProcess("REJECTED")}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Обрабатываем..." : "Отклонить"}
                        </button>
                    </div>
                </div>
            )}

            {isClient && isPending && (
                <div className="details-actions top-gap">
                    <button onClick={handleCancel} disabled={isCancelling}>
                        {isCancelling ? "Отменяем..." : "Отменить запрос"}
                    </button>
                </div>
            )}
        </div>
    );
}