import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Avatar from "../shared/ui/Avatar";
import { useAuth } from "../features/auth/model/AuthContext";
import { bookingRequestApi } from "../shared/api/bookingRequestApi";
import { avatarColor, getInitials } from "../features/calendar/lib/calendarWeek";
import {
    RESCHEDULE_STATUS_PILL,
    isReschedule,
    requestClientName,
    rescheduleLine,
} from "../features/reschedule/lib/rescheduleView";

import type { BookingRequestResponse } from "../features/booking/model/booking.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

type Tab = "pending" | "processed";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function RescheduleRequestsPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isTrainer = currentUser?.role === "TRAINER";

    const [requests, setRequests] = useState<BookingRequestResponse[]>([]);
    const [tab, setTab] = useState<Tab>("pending");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const data = isTrainer
                ? await bookingRequestApi.getTrainerBookingRequests()
                : await bookingRequestApi.getMyBookingRequests();
            setRequests(data.filter(isReschedule));
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить запросы"));
        } finally {
            setIsLoading(false);
        }
    }, [isTrainer]);

    useEffect(() => {
        void load();
    }, [load]);

    const pending = useMemo(() => requests.filter((r) => r.status === "PENDING"), [requests]);
    const processed = useMemo(() => requests.filter((r) => r.status !== "PENDING"), [requests]);
    const visible = tab === "pending" ? pending : processed;

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">Переносы</h1>
            </header>

            <div className="fb-tab-panel">
                <div className="fb-segment">
                    <button
                        type="button"
                        className={`fb-segment__item ${tab === "pending" ? "fb-segment__item--active" : ""}`}
                        onClick={() => setTab("pending")}
                    >
                        {pending.length > 0 ? `Ожидают · ${pending.length}` : "Ожидают"}
                    </button>
                    <button
                        type="button"
                        className={`fb-segment__item ${tab === "processed" ? "fb-segment__item--active" : ""}`}
                        onClick={() => setTab("processed")}
                    >
                        Обработанные
                    </button>
                </div>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : visible.length === 0 ? (
                    <div className="fb-empty" style={{ marginTop: 16 }}>
                        {tab === "pending" ? "Нет запросов, ожидающих ответа" : "Обработанных запросов пока нет"}
                    </div>
                ) : (
                    <div className="fb-list" style={{ marginTop: 16 }}>
                        {visible.map((r) => {
                            const pill = RESCHEDULE_STATUS_PILL[r.status];
                            const name = requestClientName(r);
                            return (
                                <button
                                    key={r.id}
                                    type="button"
                                    className="fb-row fb-row--button"
                                    onClick={() => navigate(`/reschedule-requests/${r.id}`)}
                                >
                                    {isTrainer && (
                                        <Avatar
                                            initials={getInitials(r.clientFirstName, r.clientLastName, name[0]?.toUpperCase())}
                                            color={avatarColor(r.clientId)}
                                            size="sm"
                                        />
                                    )}
                                    <span className="fb-row__main">
                                        <span className="fb-row__title">{isTrainer ? name : "Перенос тренировки"}</span>
                                        <span className="fb-row__sub">{rescheduleLine(r)}</span>
                                        {!isTrainer && r.trainerComment ? (
                                            <span className="fb-row__sub">Тренер ответил: {r.trainerComment}</span>
                                        ) : null}
                                    </span>
                                    {pill && <span className={`fb-pill ${pill.cls}`}>{pill.label}</span>}
                                    <span className="fb-row__chevron">›</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
