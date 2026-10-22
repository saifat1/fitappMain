import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import { clientTrainerApi } from "../shared/api/clientTrainerApi";
import { availabilityApi } from "../shared/api/availabilityApi";
import { bookingRequestApi } from "../shared/api/bookingRequestApi";
import { isReschedule } from "../features/reschedule/lib/rescheduleView";
import type { ClientTrainerResponse } from "../features/clienttrainer/model/clienttrainer.types";
import type { AvailabilitySlot, TrainerAvailabilityCalendarResponse } from "../features/availability/model/availability.types";
import type { BookingRequestResponse } from "../features/booking/model/booking.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function startOfWeek(date: Date): Date {
    const value = new Date(date);
    const day = value.getDay();
    value.setDate(value.getDate() + (day === 0 ? -6 : 1 - day));
    value.setHours(0, 0, 0, 0);
    return value;
}

function addDays(date: Date, days: number): Date {
    const value = new Date(date);
    value.setDate(value.getDate() + days);
    return value;
}

function dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function time(iso: string): string {
    return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function dayLong(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
}

function weekLabel(from: Date, to: Date): string {
    const f = from.toLocaleDateString("ru-RU", { day: "numeric", month: from.getMonth() === to.getMonth() ? undefined : "short" });
    const t = to.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    return `${f} – ${t}`;
}

function trainerName(trainer: ClientTrainerResponse): string {
    return [trainer.trainerFirstName, trainer.trainerLastName].filter(Boolean).join(" ").trim() || trainer.trainerEmail;
}

function slotKey(trainerId: number, start: string, end: string): string {
    return `${trainerId}|${start}|${end}`;
}

const REQUEST_PILL: Record<BookingRequestResponse["status"], { label: string; cls: string }> = {
    PENDING: { label: "Ждёт тренера", cls: "fb-pill--invite" },
    APPROVED: { label: "Подтверждено", cls: "fb-pill--ok" },
    DECLINED: { label: "Отклонено", cls: "fb-pill--danger" },
    CANCELLED: { label: "Отменено", cls: "fb-pill--muted" },
};

/** Client books a free slot of their trainer (FIT-63: back in the new design, reached from «Главная»). */
export default function ClientBookingPage() {
    const navigate = useNavigate();
    const [trainers, setTrainers] = useState<ClientTrainerResponse[]>([]);
    const [trainerId, setTrainerId] = useState<number | null>(null);
    const [calendar, setCalendar] = useState<TrainerAvailabilityCalendarResponse | null>(null);
    const [requests, setRequests] = useState<BookingRequestResponse[]>([]);
    const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
    const [selectedDate, setSelectedDate] = useState("");
    const [sheetSlot, setSheetSlot] = useState<AvailabilitySlot | null>(null);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCalendarLoading, setIsCalendarLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
    const isCurrentWeek = dateKey(weekStart) === dateKey(startOfWeek(new Date()));

    const loadRequests = useCallback(async () => {
        setRequests(await bookingRequestApi.getMyBookingRequests());
    }, []);

    const loadCalendar = useCallback(async (id: number, from: Date, to: Date) => {
        setIsCalendarLoading(true);
        try {
            setCalendar(await availabilityApi.getTrainerAvailability(id, dateKey(from), dateKey(to)));
        } finally {
            setIsCalendarLoading(false);
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const [list] = await Promise.all([clientTrainerApi.getMyTrainers(), loadRequests()]);
                setTrainers(list);
                if (list.length > 0) setTrainerId((current) => current ?? list[0].trainerId);
            } catch (error) {
                setErrorMessage(resolveApiError(error, "Не удалось загрузить данные"));
            } finally {
                setIsLoading(false);
            }
        })();
    }, [loadRequests]);

    useEffect(() => {
        if (trainerId == null) {
            setCalendar(null);
            return;
        }
        setSheetSlot(null);
        loadCalendar(trainerId, weekStart, weekEnd).catch((error) =>
            setErrorMessage(resolveApiError(error, "Не удалось загрузить расписание"))
        );
    }, [trainerId, weekStart, weekEnd, loadCalendar]);

    // Slots of the client's own pending/approved bookings, to show them as "requested".
    const myStatusBySlot = useMemo(() => {
        const map = new Map<string, BookingRequestResponse["status"]>();
        for (const r of requests) {
            if (r.status === "APPROVED") map.set(slotKey(r.trainerId, r.requestedStart, r.requestedEnd), "APPROVED");
            else if (r.status === "PENDING" && !map.has(slotKey(r.trainerId, r.requestedStart, r.requestedEnd))) {
                map.set(slotKey(r.trainerId, r.requestedStart, r.requestedEnd), "PENDING");
            }
        }
        return map;
    }, [requests]);

    const isFree = useCallback(
        (slot: AvailabilitySlot) => {
            const mine = trainerId != null ? myStatusBySlot.get(slotKey(trainerId, slot.start, slot.end)) : undefined;
            return slot.status === "FREE" && mine !== "PENDING" && mine !== "APPROVED";
        },
        [trainerId, myStatusBySlot]
    );

    // Today and future days of the shown week.
    const days = useMemo(() => {
        const today = dateKey(new Date());
        const result: { date: string; slots: AvailabilitySlot[] }[] = [];
        for (let i = 0; i < 7; i += 1) {
            const date = dateKey(addDays(weekStart, i));
            if (date < today) continue;
            result.push({ date, slots: (calendar?.slots ?? []).filter((s) => s.start.slice(0, 10) === date) });
        }
        return result;
    }, [calendar, weekStart]);

    // Default day = the first one with free time, picked once the week's slots have loaded
    // (picking earlier landed on today even when today was closed). A day the client tapped stays.
    const [dayPicked, setDayPicked] = useState(false);
    useEffect(() => {
        if (isCalendarLoading || calendar == null) return;
        if (days.length === 0) {
            setSelectedDate("");
        } else if (!dayPicked || !days.some((d) => d.date === selectedDate)) {
            setSelectedDate((days.find((d) => d.slots.some(isFree)) ?? days[0]).date);
        }
    }, [days, selectedDate, isFree, isCalendarLoading, calendar, dayPicked]);

    const selectedDay = days.find((d) => d.date === selectedDate) ?? null;
    const trainer = trainers.find((t) => t.trainerId === trainerId) ?? null;
    const myBookings = requests.filter((r) => !isReschedule(r));

    const submit = async () => {
        if (trainerId == null || !sheetSlot) return;
        setErrorMessage("");
        setSuccessMessage("");
        setIsSubmitting(true);
        try {
            await bookingRequestApi.createMyBookingRequest({
                trainerId,
                requestedStart: sheetSlot.start,
                requestedEnd: sheetSlot.end,
                clientComment: comment.trim() || undefined,
            });
            setSheetSlot(null);
            setComment("");
            setSuccessMessage("Запрос отправлен — тренер подтвердит запись");
            await Promise.all([loadRequests(), loadCalendar(trainerId, weekStart, weekEnd)]);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось отправить запрос"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancel = async (id: number) => {
        setErrorMessage("");
        setSuccessMessage("");
        setCancellingId(id);
        try {
            await bookingRequestApi.cancelMyBookingRequest(id);
            setSuccessMessage("Запрос отменён");
            await Promise.all([loadRequests(), trainerId != null ? loadCalendar(trainerId, weekStart, weekEnd) : Promise.resolve()]);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось отменить запрос"));
        } finally {
            setCancellingId(null);
        }
    };

    const back = (
        <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
    );

    return (
        <MobileShell title="Запись к тренеру" left={back}>
            <div className="fb-tab-panel fb-book">
                {errorMessage && <div className="fb-cal-error">{errorMessage}</div>}
                {successMessage && <div className="fb-success-note">{successMessage}</div>}

                {isLoading ? (
                    <div className="fb-empty">Загрузка…</div>
                ) : trainers.length === 0 ? (
                    <div className="fb-empty">У вас пока нет тренера. Попросите тренера прислать приглашение.</div>
                ) : (
                    <>
                        {trainers.length > 1 ? (
                            <div className="fb-chips fb-chips--wrap">
                                {trainers.map((t) => (
                                    <button
                                        key={t.trainerId}
                                        type="button"
                                        className={`fb-chip ${t.trainerId === trainerId ? "fb-chip--active" : ""}`}
                                        onClick={() => setTrainerId(t.trainerId)}
                                    >
                                        {trainerName(t)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            trainer && <div className="fb-book__trainer">Тренер: {trainerName(trainer)}</div>
                        )}

                        <div className="fb-book__week">
                            <button
                                type="button"
                                className="fb-timer__btn"
                                aria-label="Предыдущая неделя"
                                disabled={isCurrentWeek}
                                onClick={() => { setDayPicked(false); setWeekStart((w) => addDays(w, -7)); }}
                            >
                                ‹
                            </button>
                            <span className="fb-book__week-label">{weekLabel(weekStart, weekEnd)}</span>
                            <button type="button" className="fb-timer__btn" aria-label="Следующая неделя" onClick={() => { setDayPicked(false); setWeekStart((w) => addDays(w, 7)); }}>
                                ›
                            </button>
                        </div>

                        {isCalendarLoading ? (
                            <div className="fb-empty">Загружаем расписание…</div>
                        ) : days.length === 0 ? (
                            <div className="fb-empty">На этой неделе свободных дней нет</div>
                        ) : (
                            <>
                                <div className="fb-book__days">
                                    {days.map((d) => {
                                        const free = d.slots.filter(isFree).length;
                                        const date = new Date(`${d.date}T00:00:00`);
                                        return (
                                            <button
                                                key={d.date}
                                                type="button"
                                                className={`fb-book__day ${d.date === selectedDate ? "fb-book__day--active" : ""} ${free === 0 ? "fb-book__day--empty" : ""}`}
                                                onClick={() => { setDayPicked(true); setSelectedDate(d.date); }}
                                            >
                                                <span className="fb-book__day-wd">{date.toLocaleDateString("ru-RU", { weekday: "short" })}</span>
                                                <span className="fb-book__day-num">{date.getDate()}</span>
                                                <span className="fb-book__day-free">{free > 0 ? `${free} св.` : "—"}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="fb-section-title fb-section-title--flush">
                                    {selectedDate ? dayLong(`${selectedDate}T00:00:00`) : "Время"}
                                </div>

                                {!selectedDay || selectedDay.slots.length === 0 ? (
                                    <div className="fb-empty">В этот день тренер не принимает записи</div>
                                ) : (
                                    <div className="fb-book__slots">
                                        {selectedDay.slots.map((slot) => {
                                            const mine = trainerId != null ? myStatusBySlot.get(slotKey(trainerId, slot.start, slot.end)) : undefined;
                                            const free = isFree(slot);
                                            const label = mine === "APPROVED" ? "вы записаны" : mine === "PENDING" ? "запрос отправлен" : slot.status === "BUSY" ? "занято" : slot.status === "PAST" ? "прошло" : "";
                                            return (
                                                <button
                                                    key={`${slot.start}-${slot.end}`}
                                                    type="button"
                                                    className={`fb-book__slot ${free ? "" : "fb-book__slot--off"} ${mine ? "fb-book__slot--mine" : ""}`}
                                                    disabled={!free}
                                                    onClick={() => {
                                                        setSheetSlot(slot);
                                                        setComment("");
                                                    }}
                                                >
                                                    <span className="fb-book__slot-time">{time(slot.start)}</span>
                                                    {label && <span className="fb-book__slot-note">{label}</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {myBookings.length > 0 && (
                    <>
                        <div className="fb-section-title fb-section-title--flush">Мои запросы на запись</div>
                        <div className="fb-list">
                            {myBookings.map((r) => {
                                const pill = REQUEST_PILL[r.status];
                                return (
                                    <div key={r.id} className="fb-row">
                                        <span className="fb-row__main">
                                            <span className="fb-row__title">
                                                {new Date(r.requestedStart).toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" })},{" "}
                                                {time(r.requestedStart)}–{time(r.requestedEnd)}
                                            </span>
                                            {r.clientComment && <span className="fb-row__sub">{r.clientComment}</span>}
                                            {r.trainerComment && <span className="fb-row__sub">Тренер: {r.trainerComment}</span>}
                                        </span>
                                        <span className="fb-book__req-side">
                                            <span className={`fb-pill ${pill.cls}`}>{pill.label}</span>
                                            {r.status === "PENDING" && (
                                                <button type="button" className="fb-btn--danger-text fb-book__cancel" disabled={cancellingId === r.id} onClick={() => void cancel(r.id)}>
                                                    {cancellingId === r.id ? "Отменяем…" : "Отменить"}
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {sheetSlot && (
                <>
                    <button type="button" className="fb-sheet-backdrop" aria-label="Закрыть" onClick={() => !isSubmitting && setSheetSlot(null)} />
                    <div className="fb-sheet" role="dialog" aria-label="Запись на тренировку">
                        <div className="fb-sheet__scroll fb-pad">
                            <div className="fb-sheet__title">Записаться на тренировку</div>
                            <div className="fb-book__sheet-when">
                                {dayLong(sheetSlot.start)}, {time(sheetSlot.start)}–{time(sheetSlot.end)}
                            </div>
                            {trainer && <div className="fb-row__sub">Тренер: {trainerName(trainer)}</div>}
                            <label className="fb-textarea">
                                <span className="fb-textarea__label">Комментарий для тренера (необязательно)</span>
                                <textarea rows={2} value={comment} placeholder="Например: хочу силовую" onChange={(e) => setComment(e.target.value)} />
                            </label>
                            <button type="button" className="fb-btn fb-btn--primary fb-form-submit" disabled={isSubmitting} onClick={() => void submit()}>
                                {isSubmitting ? "Отправляем…" : "Отправить запрос"}
                            </button>
                            <div className="fb-hint">Тренер получит запрос и подтвердит запись — она появится в «Тренировках».</div>
                        </div>
                    </div>
                </>
            )}
        </MobileShell>
    );
}
