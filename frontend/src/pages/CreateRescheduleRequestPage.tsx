import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { trainingApi } from "../shared/api/trainingApi";
import { bookingRequestApi } from "../shared/api/bookingRequestApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { TrainingResponse } from "../features/training/model/training.types";

/**
 * "Перенос" is no longer a dedicated entity — per the 06.07.2026 conversation
 * with Katerina, a reschedule is just two things the trainer already knows
 * how to handle separately: a new booking request (needs approval) and a
 * cancellation of the old slot (read-only notification, no action needed).
 *
 * The booking request is created FIRST — if the new slot isn't available,
 * nothing has changed yet and the client can just try another time. Only
 * once the new request is safely created do we cancel the original training.
 */
export default function CreateRescheduleRequestPage() {
    const { trainingId } = useParams();
    const navigate = useNavigate();

    const [training, setTraining] = useState<TrainingResponse | null>(null);
    const [isLoadingTraining, setIsLoadingTraining] = useState(true);

    const [requestedTrainingDate, setRequestedTrainingDate] = useState("");
    const [requestedStartTime, setRequestedStartTime] = useState("");
    const [requestedEndTime, setRequestedEndTime] = useState("");
    const [clientComment, setClientComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!trainingId) return;

        trainingApi
            .getTraining(Number(trainingId))
            .then((data: TrainingResponse) => setTraining(data))
            .catch(() => setErrorMessage("Не удалось загрузить тренировку"))
            .finally(() => setIsLoadingTraining(false));
    }, [trainingId]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!trainingId || !training) {
            setErrorMessage("Не указана тренировка для переноса");
            return;
        }

        if (!requestedStartTime || !requestedEndTime) {
            setErrorMessage("Укажите время начала и окончания новой тренировки");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            // Step 1: request the new slot. If it's unavailable, the original
            // training is untouched and the client can pick another time.
            await bookingRequestApi.createMyBookingRequest({
                trainerId: training.trainerId,
                requestedStart: `${requestedTrainingDate}T${requestedStartTime}:00`,
                requestedEnd: `${requestedTrainingDate}T${requestedEndTime}:00`,
                clientComment: clientComment.trim() || undefined,
            });

            // Step 2: cancel the original slot. The trainer sees this as a
            // separate, no-action-needed "Отмена тренировки" notification.
            await trainingApi.cancelMyTraining(Number(trainingId));

            navigate("/client/booking", { replace: true });
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(
                    error.response?.data?.message ?? "Не удалось перенести тренировку"
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
                    <h2>Перенести тренировку</h2>
                    <p className="page-description">
                        Мы отправим тренеру заявку на новое время и отменим текущую запись.
                        Заявку нужно будет подтвердить — тренировка перенесётся, как только
                        тренер согласует новое время.
                    </p>
                </div>

                <button type="button" onClick={() => navigate(-1)}>
                    Назад
                </button>
            </div>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            {isLoadingTraining ? (
                <p>Загрузка…</p>
            ) : (
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
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="requestedEndTime">Новое время окончания</label>
                        <input
                            id="requestedEndTime"
                            type="time"
                            value={requestedEndTime}
                            onChange={(event) => setRequestedEndTime(event.target.value)}
                            required
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
                        {isSubmitting ? "Отправляем…" : "Отправить заявку и перенести"}
                    </button>
                </form>
            )}
        </div>
    );
}
