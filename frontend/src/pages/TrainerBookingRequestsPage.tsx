import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import Avatar from "../shared/ui/Avatar";
import { avatarColor, getInitials } from "../features/calendar/lib/calendarWeek";
import { bookingRequestApi } from "../shared/api/bookingRequestApi";
import { isReschedule } from "../features/reschedule/lib/rescheduleView";
import type { BookingRequestResponse } from "../features/booking/model/booking.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

type FilterMode = "PENDING" | "ALL";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function clientLabel(r: BookingRequestResponse): string {
    return [r.clientFirstName, r.clientLastName].filter(Boolean).join(" ").trim() || r.clientEmail || `Клиент #${r.clientId}`;
}

function when(r: BookingRequestResponse): string {
    const start = new Date(r.requestedStart);
    const day = start.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" });
    const t = (iso: string) => new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    return `${day}, ${t(r.requestedStart)}–${t(r.requestedEnd)}`;
}

const STATUS_PILL: Record<BookingRequestResponse["status"], { label: string; cls: string }> = {
    PENDING: { label: "Новый", cls: "fb-pill--invite" },
    APPROVED: { label: "Подтверждён", cls: "fb-pill--ok" },
    DECLINED: { label: "Отклонён", cls: "fb-pill--danger" },
    CANCELLED: { label: "Отменён клиентом", cls: "fb-pill--muted" },
};

/**
 * Trainer: clients' booking requests for free slots (FIT-66 — new design, reached from the calendar
 * banner and «Профиль»). Reschedule requests have their own screen and are not listed here.
 */
export default function TrainerBookingRequestsPage() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<BookingRequestResponse[]>([]);
    const [comments, setComments] = useState<Record<number, string>>({});
    const [filterMode, setFilterMode] = useState<FilterMode>("PENDING");
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const load = useCallback(async () => {
        try {
            const data = await bookingRequestApi.getTrainerBookingRequests();
            setRequests(data.filter((r) => !isReschedule(r)));
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить запросы"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const pending = useMemo(
        () => requests.filter((r) => r.status === "PENDING").sort((a, b) => a.requestedStart.localeCompare(b.requestedStart)),
        [requests]
    );
    const processed = useMemo(
        () => requests.filter((r) => r.status !== "PENDING").sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        [requests]
    );
    const visible = filterMode === "PENDING" ? pending : [...pending, ...processed];

    const review = async (r: BookingRequestResponse, action: "approve" | "decline") => {
        setProcessingId(r.id);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const payload = { trainerComment: comments[r.id]?.trim() || undefined };
            if (action === "approve") {
                await bookingRequestApi.approveBookingRequest(r.id, payload);
                setSuccessMessage(`${clientLabel(r)}: запись на ${when(r)} подтверждена — тренировка в календаре`);
            } else {
                await bookingRequestApi.declineBookingRequest(r.id, payload);
                setSuccessMessage(`${clientLabel(r)}: запрос на ${when(r)} отклонён`);
            }
            await load();
        } catch (error) {
            setErrorMessage(resolveApiError(error, action === "approve" ? "Не удалось подтвердить запрос" : "Не удалось отклонить запрос"));
        } finally {
            setProcessingId(null);
        }
    };

    const back = (
        <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
    );

    return (
        <MobileShell title="Запросы на запись" left={back}>
            <div className="fb-segment">
                <button
                    type="button"
                    className={`fb-segment__item ${filterMode === "PENDING" ? "fb-segment__item--active" : ""}`}
                    onClick={() => setFilterMode("PENDING")}
                >
                    Новые{pending.length ? ` · ${pending.length}` : ""}
                </button>
                <button
                    type="button"
                    className={`fb-segment__item ${filterMode === "ALL" ? "fb-segment__item--active" : ""}`}
                    onClick={() => setFilterMode("ALL")}
                >
                    Все
                </button>
            </div>

            <div className="fb-tab-panel fb-breq">
                {successMessage && <div className="fb-success-note">{successMessage}</div>}
                {errorMessage && <div className="fb-cal-error">{errorMessage}</div>}

                {isLoading ? (
                    <div className="fb-empty">Загрузка…</div>
                ) : visible.length === 0 ? (
                    <div className="fb-empty">
                        {filterMode === "PENDING" ? "Новых запросов нет" : "Запросов пока не было"}
                        <br />
                        <span className="fb-hint">Клиенты записываются на свободное время из «Рабочего времени».</span>
                    </div>
                ) : (
                    visible.map((r) => {
                        const pill = STATUS_PILL[r.status];
                        const busy = processingId === r.id;
                        return (
                            <div key={r.id} className="fb-breq__card">
                                <div className="fb-breq__head">
                                    <Avatar
                                        initials={getInitials(r.clientFirstName ?? null, r.clientLastName ?? null, r.clientEmail?.[0]?.toUpperCase() ?? "К")}
                                        color={avatarColor(r.clientId)}
                                        size="md"
                                    />
                                    <div className="fb-breq__main">
                                        <div className="fb-breq__client">{clientLabel(r)}</div>
                                        <div className="fb-breq__when">{when(r)}</div>
                                    </div>
                                    <span className={`fb-pill ${pill.cls}`}>{pill.label}</span>
                                </div>

                                {r.clientComment && <div className="fb-breq__comment">«{r.clientComment}»</div>}
                                {r.status !== "PENDING" && r.trainerComment && (
                                    <div className="fb-breq__comment fb-breq__comment--trainer">Ваш ответ: {r.trainerComment}</div>
                                )}

                                {r.status === "PENDING" && (
                                    <>
                                        <label className="fb-textarea fb-breq__reply">
                                            <span className="fb-textarea__label">Ответ клиенту (необязательно)</span>
                                            <textarea
                                                rows={1}
                                                value={comments[r.id] ?? ""}
                                                placeholder="Например: жду в зале у ресепшена"
                                                onChange={(e) => setComments((prev) => ({ ...prev, [r.id]: e.target.value }))}
                                            />
                                        </label>
                                        <div className="fb-breq__actions">
                                            <button type="button" className="fb-btn fb-btn--ghost" disabled={busy} onClick={() => void review(r, "decline")}>
                                                Отклонить
                                            </button>
                                            <button type="button" className="fb-btn fb-btn--primary" disabled={busy} onClick={() => void review(r, "approve")}>
                                                {busy ? "Сохраняем…" : "Подтвердить"}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </MobileShell>
    );
}
