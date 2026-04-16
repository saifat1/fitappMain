import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DayPicker } from "react-day-picker";
import { ru } from "react-day-picker/locale";

import { useAuth } from "../features/auth/model/AuthContext";
import { trainingApi } from "../shared/api/trainingApi";
import { trainerApi } from "../shared/api/trainerApi";

import CalendarDayAgenda from "../features/calendar/ui/CalendarDayAgenda";
import QuickCreateTrainingSheet from "../features/calendar/ui/QuickCreateTrainingSheet";

import {
    buildHourSlots,
    formatDateKey,
    formatMonthTitle,
    getDefaultSelectedDate,
    getMonthRange,
    getMonthStart,
    groupTrainingsByDate,
    parseDateKey,
    shiftMonth,
} from "../features/calendar/lib/trainerCalendar";

import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { TrainingResponse } from "../features/training/model/training.types";
import type { TrainerClientResponse } from "../features/trainer/model/trainer.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function normalizeTime(value?: string | null): string {
    if (!value) {
        return "";
    }

    return value.slice(0, 5);
}

function ClientHomeFallback() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return (
            <div className="dashboard-page">
                <div className="error-box">Пользователь не загружен</div>
            </div>
        );
    }

    const fullName =
        [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || "Пользователь";

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div>
                    <div className="dashboard-kicker">Профиль</div>
                    <h1 className="dashboard-title">{fullName}</h1>
                    <p className="dashboard-subtitle">
                        Клиентская версия главной пока остаётся без изменений.
                    </p>
                </div>
            </section>

            <section className="dashboard-grid">
                <Link to="/trainings" className="dashboard-card">
                    <h3>Тренировки</h3>
                    <p>Посмотреть свои тренировки</p>
                </Link>

                <Link to="/reschedule-requests" className="dashboard-card">
                    <h3>Переносы</h3>
                    <p>Отследить статусы запросов</p>
                </Link>
            </section>
        </div>
    );
}

export default function MePage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [currentMonth, setCurrentMonth] = useState<Date>(getMonthStart(new Date()));
    const [selectedDate, setSelectedDate] = useState<string>(getDefaultSelectedDate(new Date()));

    const [trainings, setTrainings] = useState<TrainingResponse[]>([]);
    const [clients, setClients] = useState<TrainerClientResponse[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [processingTrainingId, setProcessingTrainingId] = useState<number | null>(null);

    const [errorMessage, setErrorMessage] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedStartTime, setSelectedStartTime] = useState<string | undefined>(undefined);

    const isTrainer = currentUser?.role === "TRAINER";

    const monthRange = useMemo(() => getMonthRange(currentMonth), [currentMonth]);
    const trainingsByDate = useMemo(() => groupTrainingsByDate(trainings), [trainings]);

    const selectedDayTrainings = useMemo(
        () =>
            [...(trainingsByDate[selectedDate] ?? [])].sort((a, b) => {
                const aTime = normalizeTime(a.startTime) || "99:99";
                const bTime = normalizeTime(b.startTime) || "99:99";

                if (aTime !== bTime) {
                    return aTime.localeCompare(bTime);
                }

                return a.id - b.id;
            }),
        [trainingsByDate, selectedDate]
    );

    const hourSlots = useMemo(() => buildHourSlots(8, 21), []);

    const daysWithPlannedTrainings = useMemo(() => {
        const unique = new Set(
            trainings
                .filter((item) => item.status === "PLANNED")
                .map((item) => item.trainingDate)
        );

        return Array.from(unique).map(parseDateKey);
    }, [trainings]);

    const loadTrainings = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await trainingApi.getTrainings(monthRange.from, monthRange.to);
            setTrainings(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить календарь"));
        } finally {
            setIsLoading(false);
        }
    }, [monthRange.from, monthRange.to]);

    const loadClients = useCallback(async () => {
        if (!isTrainer) {
            return;
        }

        setIsLoadingClients(true);

        try {
            const data = await trainerApi.getClients();
            setClients(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить клиентов"));
        } finally {
            setIsLoadingClients(false);
        }
    }, [isTrainer]);

    useEffect(() => {
        if (!isTrainer) {
            return;
        }

        void loadTrainings();
    }, [isTrainer, loadTrainings]);

    useEffect(() => {
        if (!isTrainer) {
            return;
        }

        void loadClients();
    }, [isTrainer, loadClients]);

    if (!currentUser) {
        return (
            <div className="dashboard-page">
                <div className="error-box">Пользователь не загружен</div>
            </div>
        );
    }

    if (!isTrainer) {
        return <ClientHomeFallback />;
    }

    const selectedDay = parseDateKey(selectedDate);

    const handleOpenCreate = (startTime?: string) => {
        setSelectedStartTime(startTime);
        setIsCreateOpen(true);
    };

    const handleCreateTraining = async (payload: {
        clientId: number;
        trainingDate: string;
        startTime?: string;
        endTime?: string;
        trainerNote?: string;
    }) => {
        setIsCreating(true);
        setErrorMessage("");

        try {
            const created = await trainingApi.createTraining(payload);

            setTrainings((prev) => [...prev, created]);
            setSelectedDate(payload.trainingDate);
            setIsCreateOpen(false);
            setSelectedStartTime(undefined);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось создать тренировку"));
        } finally {
            setIsCreating(false);
        }
    };

    const handleQuickCompleteTraining = async (trainingId: number) => {
        setProcessingTrainingId(trainingId);
        setErrorMessage("");

        try {
            await trainingApi.completeTraining(trainingId);
            const updated = await trainingApi.getTraining(trainingId);

            setTrainings((prev) =>
                prev.map((item) => (item.id === trainingId ? updated : item))
            );
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось завершить тренировку"));
        } finally {
            setProcessingTrainingId(null);
        }
    };

    const handleQuickCancelTraining = async (trainingId: number) => {
        const confirmed = window.confirm("Отменить тренировку?");
        if (!confirmed) {
            return;
        }

        setProcessingTrainingId(trainingId);
        setErrorMessage("");

        try {
            await trainingApi.cancelTraining(trainingId);
            const updated = await trainingApi.getTraining(trainingId);

            setTrainings((prev) =>
                prev.map((item) => (item.id === trainingId ? updated : item))
            );
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось отменить тренировку"));
        } finally {
            setProcessingTrainingId(null);
        }
    };

    const handleQuickRescheduleTraining = (trainingId: number) => {
        navigate("/reschedule-requests", {
            state: { trainingId, source: "calendar" },
        });
    };

    const handlePrevMonth = () => {
        const nextMonth = shiftMonth(currentMonth, -1);
        setCurrentMonth(nextMonth);
        setSelectedDate(getDefaultSelectedDate(nextMonth));
    };

    const handleNextMonth = () => {
        const nextMonth = shiftMonth(currentMonth, 1);
        setCurrentMonth(nextMonth);
        setSelectedDate(getDefaultSelectedDate(nextMonth));
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentMonth(getMonthStart(today));
        setSelectedDate(formatDateKey(today));
    };

    return (
        <div className="coach-calendar-page entity-page-compact">
            <section className="coach-calendar-header coach-calendar-panel">
                <div className="coach-calendar-header-top">
                    <div className="coach-calendar-header-main">
                        <h1 className="coach-calendar-title">Календарь тренировок</h1>
                        <p className="coach-calendar-subtitle">
                            Выбирай день, смотри расписание и быстро создавай новую тренировку.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-primary coach-calendar-add-btn"
                        onClick={() => handleOpenCreate()}
                        disabled={isLoadingClients}
                    >
                        Добавить тренировку
                    </button>
                </div>

                <div className="coach-calendar-toolbar">
                    <div className="coach-calendar-nav">
                        <button
                            type="button"
                            className="coach-calendar-v2-nav-btn"
                            onClick={handlePrevMonth}
                            title="Предыдущий месяц"
                        >
                            ‹
                        </button>

                        <div className="coach-calendar-month-title">
                            {formatMonthTitle(currentMonth)}
                        </div>

                        <button
                            type="button"
                            className="coach-calendar-v2-nav-btn"
                            onClick={handleNextMonth}
                            title="Следующий месяц"
                        >
                            ›
                        </button>
                    </div>

                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary coach-calendar-today-btn"
                        onClick={handleToday}
                    >
                        Сегодня
                    </button>
                </div>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <div className="coach-calendar-layout">
                <section className="coach-calendar-panel coach-calendar-panel--month">
                    {isLoading ? (
                        <div className="coach-calendar-loading">Загрузка...</div>
                    ) : (
                        <DayPicker
                            className="coach-rdp"
                            locale={ru}
                            mode="single"
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            selected={selectedDay}
                            onSelect={(date) => {
                                if (!date) {
                                    return;
                                }

                                setSelectedDate(formatDateKey(date));

                                if (
                                    date.getMonth() !== currentMonth.getMonth() ||
                                    date.getFullYear() !== currentMonth.getFullYear()
                                ) {
                                    setCurrentMonth(getMonthStart(date));
                                }
                            }}
                            showOutsideDays
                            fixedWeeks
                            hideNavigation
                            modifiers={{
                                hasTrainings: daysWithPlannedTrainings,
                            }}
                            modifiersClassNames={{
                                hasTrainings: "coach-rdp-day-has-trainings",
                            }}
                        />
                    )}
                </section>

                <div className="coach-calendar-right">
                    <CalendarDayAgenda
                        selectedDate={selectedDate}
                        hourSlots={hourSlots}
                        trainings={selectedDayTrainings}
                        processingTrainingId={processingTrainingId}
                        onOpenTraining={(trainingId) => navigate(`/trainings/${trainingId}`)}
                        onQuickAdd={handleOpenCreate}
                        onCompleteTraining={handleQuickCompleteTraining}
                        onCancelTraining={handleQuickCancelTraining}
                        onRescheduleTraining={handleQuickRescheduleTraining}
                    />
                </div>
            </div>

            <QuickCreateTrainingSheet
                isOpen={isCreateOpen}
                selectedDate={selectedDate}
                selectedStartTime={selectedStartTime}
                clients={clients}
                isSubmitting={isCreating}
                onSubmit={handleCreateTraining}
                onClose={() => {
                    setIsCreateOpen(false);
                    setSelectedStartTime(undefined);
                }}
            />
        </div>
    );
}