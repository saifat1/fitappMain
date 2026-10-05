import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Avatar from "../shared/ui/Avatar";
import { useAuth } from "../features/auth/model/AuthContext";
import { bookingRequestApi } from "../shared/api/bookingRequestApi";
import { avatarColor, getInitials } from "../features/calendar/lib/calendarWeek";
import { formatTrainingDay, shortTime } from "../features/training/lib/trainingDates";
import {
    RESCHEDULE_STATUS_PILL,
    requestClientName,
    requestedDateKey,
    requestedEndTime,
    requestedStartTime,
} from "../features/reschedule/lib/rescheduleView";

import type { BookingRequestResponse } from "../features/booking/model/booking.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function RescheduleRequestDetailsPage() {
    const navigate = useNavigate();
    const { id: idParam } = useParams();
    const id = Number(idParam);
    const { currentUser } = useAuth();
    const isTrainer = currentUser?.role === "TRAINER";

    const [request, setRequest] = useState<BookingRequestResponse | null>(null);
    const [trainerComment, setTrainerComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // There is no single-request endpoint; the lists are short, so pick from them.
    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const list = isTrainer
                ? await bookingRequestApi.getTrainerBookingRequests()
                : await bookingRequestApi.getMyBookingRequests();
            setRequest(list.find((r) => r.id === id) ?? null);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить запрос"));
        } finally {
            setIsLoading(false);
        }
    }, [id, isTrainer]);

    useEffect(() => {
        void load();
    }, [load]);

    const run = async (action: () => Promise<BookingRequestResponse>, fallback: string) => {
        setIsProcessing(true);
        setErrorMessage("");
        try {
            setRequest(await action());
        } catch (error) {
            setErrorMessage(resolveApiError(error, fallback));
        } finally {
            setIsProcessing(false);
        }
    };

    const approve = () =>
        run(
            () => bookingRequestApi.approveBookingRequest(id, { trainerComment: trainerComment.trim() || undefined }),
            "Не удалось подтвердить перенос"
        );
    const decline = () =>
        run(
            () => bookingRequestApi.declineBookingRequest(id, { trainerComment: trainerComment.trim() || undefined }),
            "Не удалось отклонить запрос"
        );
    const withdraw = () => run(() => bookingRequestApi.cancelMyBookingRequest(id), "Не удалось отозвать запрос");

    const header = (
        <header className="fb-topbar">
            <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                ‹
            </button>
            <h1 className="fb-topbar__title">
                {request && !request.originalTrainingId ? "Заявка на тренировку" : "Запрос на перенос"}
            </h1>
        </header>
    );

    if (isLoading || !request) {
        return (
            <div className="fb-screen">
                {header}
                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : (
                    <div className="fb-cal-error">{errorMessage || "Запрос не найден"}</div>
                )}
            </div>
        );
    }

    const pill = RESCHEDULE_STATUS_PILL[request.status];
    const isPending = request.status === "PENDING";
    const name = requestClientName(request);

    return (
        <div className="fb-screen">
            {header}

            <div className="fb-body">
                <div className="fb-training-client">
                    <Avatar
                        initials={getInitials(request.clientFirstName, request.clientLastName, name[0]?.toUpperCase())}
                        color={avatarColor(request.clientId)}
                        size="md"
                    />
                    <div className="fb-training-client__main">
                        <div className="fb-training-client__label">Клиент</div>
                        <div className="fb-training-client__name">{name}</div>
                    </div>
                    {pill && <span className={`fb-pill ${pill.cls}`}>{pill.label}</span>}
                </div>

                <div className="fb-reschedule-compare">
                    {request.originalTrainingDate && (
                        <div className="fb-reschedule-compare__cell fb-reschedule-compare__cell--old">
                            <span className="fb-reschedule-compare__label">Было</span>
                            <span className="fb-reschedule-compare__date">{formatTrainingDay(request.originalTrainingDate)}</span>
                            <span className="fb-reschedule-compare__time">
                                {shortTime(request.originalStartTime ?? null)}–{shortTime(request.originalEndTime ?? null)}
                            </span>
                        </div>
                    )}
                    <div className="fb-reschedule-compare__cell fb-reschedule-compare__cell--new">
                        <span className="fb-reschedule-compare__label">
                            {request.status === "APPROVED" ? "Стало" : "Предлагает"}
                        </span>
                        <span className="fb-reschedule-compare__date">{formatTrainingDay(requestedDateKey(request))}</span>
                        <span className="fb-reschedule-compare__time">
                            {requestedStartTime(request)}–{requestedEndTime(request)}
                        </span>
                    </div>
                </div>

                {request.clientComment && (
                    <div className="fb-readonly" style={{ marginTop: 8 }}>
                        <span className="fb-readonly__label">Комментарий клиента</span>
                        <span className="fb-readonly__value">{request.clientComment}</span>
                    </div>
                )}

                {!isPending && request.trainerComment && (
                    <div className="fb-readonly">
                        <span className="fb-readonly__label">Ответ тренера</span>
                        <span className="fb-readonly__value">{request.trainerComment}</span>
                    </div>
                )}

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                {isPending && isTrainer && (
                    <>
                        <label className="fb-textarea">
                            <span className="fb-textarea__label">Ваш ответ (необязательно)</span>
                            <textarea
                                rows={2}
                                placeholder="Например: ок, жду в 19:00"
                                value={trainerComment}
                                onChange={(e) => setTrainerComment(e.target.value)}
                            />
                        </label>

                        <button
                            type="button"
                            className="fb-btn fb-btn--primary fb-form-submit"
                            onClick={() => void approve()}
                            disabled={isProcessing}
                        >
                            Подтвердить перенос
                        </button>
                        <button
                            type="button"
                            className="fb-btn fb-btn--ghost fb-btn--danger-text"
                            style={{ marginTop: 8 }}
                            onClick={() => void decline()}
                            disabled={isProcessing}
                        >
                            Отклонить
                        </button>
                    </>
                )}

                {isPending && !isTrainer && (
                    <>
                        <div className="fb-info-note">
                            <span className="fb-info-note__icon">ⓘ</span>
                            <span>Ждём ответа тренера. До этого тренировка остаётся в старое время.</span>
                        </div>
                        <button
                            type="button"
                            className="fb-btn fb-btn--ghost fb-form-submit fb-btn--danger-text"
                            onClick={() => void withdraw()}
                            disabled={isProcessing}
                        >
                            Отозвать запрос
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
