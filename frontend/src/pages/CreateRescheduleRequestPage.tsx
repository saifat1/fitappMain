import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import FbTextField from "../shared/ui/FbTextField";
import { trainingApi } from "../shared/api/trainingApi";
import { bookingRequestApi } from "../shared/api/bookingRequestApi";
import { formatTrainingDay, shortTime } from "../features/training/lib/trainingDates";

import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { TrainingResponse } from "../features/training/model/training.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

/**
 * Client asks to move a training. This creates a booking request linked to
 * the original training; the original stays in the calendar until the trainer
 * approves (the backend then cancels it and creates the new one).
 */
export default function CreateRescheduleRequestPage() {
    const navigate = useNavigate();
    const { trainingId } = useParams();
    const id = Number(trainingId);

    const [training, setTraining] = useState<TrainingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [date, setDate] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!id) return;
        trainingApi
            .getTraining(id)
            .then((data: TrainingResponse) => {
                setTraining(data);
                setDate(data.trainingDate);
                setStart(shortTime(data.startTime));
                setEnd(shortTime(data.endTime));
            })
            .catch(() => setErrorMessage("Не удалось загрузить тренировку"))
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleSubmit = async () => {
        if (!training) return;

        if (!date || !start || !end) {
            setErrorMessage("Укажите дату и время новой тренировки");
            return;
        }
        if (end <= start) {
            setErrorMessage("Конец должен быть позже начала");
            return;
        }
        if (date === training.trainingDate && start === shortTime(training.startTime) && end === shortTime(training.endTime)) {
            setErrorMessage("Новое время совпадает с текущим");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);
        try {
            await bookingRequestApi.createMyBookingRequest({
                trainerId: training.trainerId,
                originalTrainingId: training.id,
                requestedStart: `${date}T${start}:00`,
                requestedEnd: `${date}T${end}:00`,
                clientComment: comment.trim() || undefined,
            });
            navigate("/reschedule-requests", { replace: true });
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось отправить запрос"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentLabel = training
        ? `${formatTrainingDay(training.trainingDate)}${
              training.startTime ? ` · ${shortTime(training.startTime)}–${shortTime(training.endTime)}` : ""
          }`
        : "";

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">Перенос тренировки</h1>
            </header>

            <div className="fb-body">
                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : !training ? (
                    <div className="fb-cal-error">{errorMessage || "Тренировка не найдена"}</div>
                ) : (
                    <>
                        <div className="fb-readonly">
                            <span className="fb-readonly__label">Сейчас</span>
                            <span className="fb-readonly__value">{currentLabel}</span>
                        </div>

                        <div className="fb-section-title fb-section-title--flush" style={{ marginTop: 8 }}>
                            Новое время
                        </div>

                        <FbTextField id="rs-date" label="Дата" type="date" value={date} onChange={setDate} />
                        {date ? <div className="fb-field-hint">{formatTrainingDay(date)}</div> : null}

                        <div className="fb-two-col">
                            <FbTextField id="rs-start" label="Начало" type="time" value={start} onChange={setStart} />
                            <FbTextField id="rs-end" label="Конец" type="time" value={end} onChange={setEnd} />
                        </div>

                        <label className="fb-textarea">
                            <span className="fb-textarea__label">Комментарий для тренера</span>
                            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
                        </label>

                        <div className="fb-info-note">
                            <span className="fb-info-note__icon">ⓘ</span>
                            <span>Тренер получит уведомление. Пока он не ответит, тренировка остаётся в старое время.</span>
                        </div>

                        {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                        <button
                            type="button"
                            className="fb-btn fb-btn--primary fb-form-submit"
                            onClick={() => void handleSubmit()}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Отправляем…" : "Отправить запрос"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
