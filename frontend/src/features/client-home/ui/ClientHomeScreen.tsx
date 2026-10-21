import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import MobileShell from "../../../widgets/MobileShell";
import Avatar from "../../../shared/ui/Avatar";
import NotificationBell from "../../notification/ui/NotificationBell";
import CalendarIcon from "../../training/ui/CalendarIcon";
import HouseIcon from "../../training/ui/HouseIcon";
import TicketIcon from "../../training/ui/TicketIcon";
import UpcomingTrainingRow from "../../training/ui/UpcomingTrainingRow";
import { useAuth } from "../../auth/model/AuthContext";
import { trainingApi } from "../../../shared/api/trainingApi";
import { clientTrainerApi } from "../../../shared/api/clientTrainerApi";
import { clientContractApi } from "../../../shared/api/clientContractApi";
import { bookingRequestApi } from "../../../shared/api/bookingRequestApi";
import { isReschedule } from "../../reschedule/lib/rescheduleView";
import { avatarColor, getInitials } from "../../calendar/lib/calendarWeek";
import { sortTrainingsByDateTime } from "../../training/lib/trainingView";
import { addDaysKey, durationMinutes, formatTrainingDay, shortTime, todayKey } from "../../training/lib/trainingDates";

import { trainingTitle, type TrainingResponse } from "../../training/model/training.types";
import type { ClientTrainerResponse } from "../../clienttrainer/model/clienttrainer.types";
import type { MyContractSummary } from "../../contract/model/contract.types";
import type { ApiErrorResponse } from "../../auth/model/auth.types";

const UPCOMING_WINDOW_DAYS = 90;

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function trainerName(trainer: ClientTrainerResponse): string {
    const full = [trainer.trainerFirstName, trainer.trainerLastName].filter(Boolean).join(" ").trim();
    return full || trainer.trainerEmail;
}

/** Is the training still ahead of us (today's ones count until their start time). */
function isAhead(t: TrainingResponse, today: string, nowTime: string): boolean {
    if (t.trainingDate > today) return true;
    if (t.trainingDate < today) return false;
    return !t.startTime || t.startTime.slice(0, 5) >= nowTime;
}

export default function ClientHomeScreen() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [trainings, setTrainings] = useState<TrainingResponse[]>([]);
    const [trainer, setTrainer] = useState<ClientTrainerResponse | null>(null);
    const [summary, setSummary] = useState<MyContractSummary | null>(null);
    const [pendingReschedules, setPendingReschedules] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");
        const today = todayKey();
        try {
            const data: TrainingResponse[] = await trainingApi.getTrainings(
                today,
                addDaysKey(today, UPCOMING_WINDOW_DAYS)
            );
            setTrainings(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить тренировки"));
        } finally {
            setIsLoading(false);
        }

        // Decorations: a failure here must not blank the screen.
        clientTrainerApi.getMyTrainers().then((list) => setTrainer(list[0] ?? null)).catch(() => undefined);
        clientContractApi.getMySummary().then(setSummary).catch(() => undefined);
        bookingRequestApi
            .getMyBookingRequests()
            .then((list) => setPendingReschedules(list.filter((r) => isReschedule(r) && r.status === "PENDING").length))
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const upcoming = useMemo(() => {
        const today = todayKey();
        const now = new Date();
        const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        return sortTrainingsByDateTime(
            trainings.filter((t) => t.status === "PLANNED" && isAhead(t, today, nowTime))
        );
    }, [trainings]);

    if (!currentUser) {
        return null;
    }

    const next = upcoming[0] ?? null;
    const rest = upcoming.slice(1, 4);
    const firstName = currentUser.firstName?.trim() || "";
    const nextIsPersonal = next ? next.trainingType !== "INDEPENDENT" : false;
    const nextDuration = next ? durationMinutes(next.startTime, next.endTime) : null;

    return (
        <MobileShell title="Главная" right={<NotificationBell />}>
            <div className="fb-body">
                <div className="fb-client-greeting">
                    <Avatar
                        initials={getInitials(currentUser.firstName, currentUser.lastName, currentUser.email[0]?.toUpperCase() ?? "?")}
                        color={avatarColor(currentUser.id)}
                        size="md"
                    />
                    <div className="fb-client-greeting__text">
                        <span className="fb-client-greeting__title">{firstName ? `Привет, ${firstName}` : "Привет!"}</span>
                        {trainer && <span className="fb-client-greeting__sub">Тренер: {trainerName(trainer)}</span>}
                    </div>
                </div>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                {summary?.hasContracts && (
                    <div className={`fb-contract-card ${summary.exhausted ? "fb-contract-card--exhausted" : ""}`}>
                        <span className="fb-contract-card__icon">
                            <TicketIcon />
                        </span>
                        <span className="fb-contract-card__label">Осталось персональных тренировок</span>
                        <span className="fb-contract-card__count">
                            {Math.max(summary.totalRemainingTrainings, 0)}{" "}
                            <span className="fb-contract-card__count-total">из {summary.totalGrantedTrainings}</span>
                        </span>
                    </div>
                )}

                <div className="fb-section-header">
                    <span className="fb-section-title fb-section-title--flush">Ближайшая тренировка</span>
                </div>

                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : next ? (
                    <div className="fb-next-training">
                        <div className="fb-next-training__head">
                            <span className={`fb-training-row__icon ${nextIsPersonal ? "fb-training-row__icon--personal" : "fb-training-row__icon--independent"}`}>
                                {nextIsPersonal ? <CalendarIcon /> : <HouseIcon />}
                            </span>
                            <div className="fb-next-training__main">
                                <span className="fb-next-training__title">
                                    {formatTrainingDay(next.trainingDate)}
                                    {next.startTime ? `, ${shortTime(next.startTime)}` : ""}
                                </span>
                                <span className="fb-next-training__sub">
                                    {trainingTitle(next)}
                                    {nextDuration ? ` · ${nextDuration} мин` : ""}
                                </span>
                            </div>
                        </div>
                        <div className="fb-next-training__actions">
                            {nextIsPersonal && (
                                <button
                                    type="button"
                                    className="fb-btn fb-btn--ghost"
                                    onClick={() => navigate(`/trainings/${next.id}/reschedule-request`)}
                                >
                                    Перенести
                                </button>
                            )}
                            <button
                                type="button"
                                className="fb-btn fb-btn--primary"
                                onClick={() => navigate(`/trainings/${next.id}`)}
                            >
                                Подробнее
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="fb-empty">Запланированных тренировок нет</div>
                )}

                {rest.length > 0 && (
                    <>
                        <div className="fb-section-header">
                            <span className="fb-section-title fb-section-title--flush">Дальше по плану</span>
                            <button type="button" className="fb-section-header__link" onClick={() => navigate("/trainings")}>
                                Все ›
                            </button>
                        </div>
                        <div className="fb-list">
                            {rest.map((t) => (
                                <UpcomingTrainingRow
                                    key={t.id}
                                    training={t}
                                    showStatus={false}
                                    onClick={() => navigate(`/trainings/${t.id}`)}
                                />
                            ))}
                        </div>
                    </>
                )}

                <div className="fb-list" style={{ marginTop: 16 }}>
                    <button type="button" className="fb-row fb-row--button" onClick={() => navigate("/reschedule-requests")}>
                        <span className="fb-row__main">
                            <span className="fb-row__title">Мои запросы на перенос</span>
                            {pendingReschedules > 0 && (
                                <span className="fb-row__sub">
                                    {pendingReschedules === 1
                                        ? "1 ждёт ответа тренера"
                                        : `${pendingReschedules} ждут ответа тренера`}
                                </span>
                            )}
                        </span>
                        <span className="fb-row__chevron">›</span>
                    </button>
                </div>
            </div>
        </MobileShell>
    );
}
