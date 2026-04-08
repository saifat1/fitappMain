import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { rescheduleApi } from "../shared/api/rescheduleApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

export default function CreateRescheduleRequestPage() {
    const { trainingId } = useParams();
    const navigate = useNavigate();

    const [requestedTrainingDate, setRequestedTrainingDate] = useState("");
    const [requestedStartTime, setRequestedStartTime] = useState("");
    const [requestedEndTime, setRequestedEndTime] = useState("");
    const [clientComment, setClientComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!trainingId) {
            setErrorMessage("Не указан id тренировки");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const created = await rescheduleApi.createRequest(Number(trainingId), {
                requestedTrainingDate,
                requestedStartTime: requestedStartTime || undefined,
                requestedEndTime: requestedEndTime || undefined,
                clientComment: clientComment.trim() || undefined,
            });

            navigate(`/reschedule-requests/${created.id}`, { replace: true });
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? "Не удалось создать запрос на перенос"
                );
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-card">
            <div className="page-header-row">
                <div>
                    <h2>Запросить перенос тренировки</h2>
                    <p className="page-description">Training ID: {trainingId}</p>
                </div>

                <button onClick={() => navigate(-1)}>Назад</button>
            </div>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <form className="form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <label htmlFor="requestedTrainingDate">Новая дата</label>
                    <input
                        id="requestedTrainingDate"
                        type="date"
                        value={requestedTrainingDate}
                        onChange={(event) => setRequestedTrainingDate(event.target.value)}
                        required
                    />
                </div>

                <div className="form-row">
                    <label htmlFor="requestedStartTime">Новое время начала</label>
                    <input
                        id="requestedStartTime"
                        type="time"
                        value={requestedStartTime}
                        onChange={(event) => setRequestedStartTime(event.target.value)}
                    />
                </div>

                <div className="form-row">
                    <label htmlFor="requestedEndTime">Новое время окончания</label>
                    <input
                        id="requestedEndTime"
                        type="time"
                        value={requestedEndTime}
                        onChange={(event) => setRequestedEndTime(event.target.value)}
                    />
                </div>

                <div className="form-row">
                    <label htmlFor="clientComment">Комментарий</label>
                    <textarea
                        id="clientComment"
                        value={clientComment}
                        onChange={(event) => setClientComment(event.target.value)}
                        rows={4}
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Отправляем..." : "Отправить запрос"}
                </button>
            </form>
        </div>
    );
}