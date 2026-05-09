import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DayPicker } from "react-day-picker";
import { ru } from "react-day-picker/locale";
import { useAuth } from "../features/auth/model/AuthContext";
import { trainingApi } from "../shared/api/trainingApi";
import { trainerApi } from "../shared/api/trainerApi";
import { availabilityApi } from "../shared/api/availabilityApi";
import { dutySlotApi } from "../shared/api/dutySlotApi";
import CalendarDayAgenda from "../features/calendar/ui/CalendarDayAgenda";
import QuickCreateTrainingSheet from "../features/calendar/ui/QuickCreateTrainingSheet";
import {
    buildDayAgendaRows,
    formatDateKey,
    formatMonthTitle,
    getAvailabilityDatesForMonth,
    getDefaultSelectedDate,
    getMonthRange,
    getMonthStart,
    groupTrainingsByDate,
    parseDateKey,
    shiftMonth,
} from "../features/calendar/lib/trainerCalendar";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    TrainerAvailabilityException,
    TrainerAvailabilityRule,
} from "../features/availability/model/availability.types";
import type { TrainerDutySlotResponse } from "../features/duty-slot/model/dutySlot.types";
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

function plusOneHour(value: string): string {
    const [hours, minutes] = value.split(":").map(Number);
    const nextHour = (hours + 1) % 24;
    return `${String(nextHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

function ClientHomeFallback() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <div>Пользователь не загружен</div>;
    }

    const fullName =
        [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
        "Пользователь";

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div>
                    <p className="dashboard-kicker">Профиль</p>
                    <h1 className="dashboard-title">{fullName}</h1>
                    <p className="dashboard-subtitle">
                        Клиентская версия главной пока остаётся без изменений.
                    </p>
                </div>
            </section>

            <section className="dashboard-grid">
                <article className="dashboard-card">
                    <h3>Тренировки</h3>
                    <Link to="/trainings">Посмотреть свои тренировки</Link>
                </article>

                <article className="dashboard-card">
                    <h3>Переносы</h3>
                    <Link to="/reschedule-requests">Отследить статусы запросов</Link>
                </article>
            </section>
        </div>
    );
}

export default function MePage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [currentMonth, setCurrentMonth] = useState(getMonthStart(new Date()));
    const [selectedDate, setSelectedDate] = useState(
        getDefaultSelectedDate(new Date())
    );

    const [trainings, setTrainings] = useState<TrainingResponse[]>([]);
    const [clients, setClients] = useState<TrainerClientResponse[]>([]);
    const [availabilityRules, setAvailabilityRules] = useState<TrainerAvailabilityRule[]>([]);
    const [availabilityExceptions, setAvailabilityExceptions] = useState<
        TrainerAvailabilityException[]
    >([]);
    const [dutySlots, setDutySlots] = useState<TrainerDutySlotResponse[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [isLoadingDutySlots, setIsLoadingDutySlots] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [processingTrainingId, setProcessingTrainingId] = useState<number | null>(null);
    const [processingDutyKey, setProcessingDutyKey] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedStartTime, setSelectedStartTime] = useState<string | undefined>(
        undefined
    );

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

    const agendaRows = useMemo(
        () =>
            buildDayAgendaRows(
                selectedDate,
                selectedDayTrainings,
                availabilityRules,
                availabilityExceptions
            ),
        [selectedDate, selectedDayTrainings, availabilityRules, availabilityExceptions]
    );

    const selectedDayDutySlots = useMemo(
        () =>
            dutySlots
                .filter((item) => item.dutyDate === selectedDate)
                .sort((a, b) => a.startTime.localeCompare(b.startTime)),
        [dutySlots, selectedDate]
    );

    const dutySlotsByStartTime = useMemo(
        () =>
            selectedDayDutySlots.reduce<Record<string, TrainerDutySlotResponse>>(
                (acc, item) => {
                    acc[item.startTime.slice(0, 5)] = item;
                    return acc;
                },
                {}
            ),
        [selectedDayDutySlots]
    );

    const daysWithPlannedTrainings = useMemo(() => {
        const unique = new Set(
            trainings.filter((item) => item.status === "PLANNED").map((item) => item.trainingDate)
        );
        return Array.from(unique).map(parseDateKey);
    }, [trainings]);

    const availabilityMarkers = useMemo(
        () =>
            getAvailabilityDatesForMonth(
                currentMonth,
                availabilityRules,
                availabilityExceptions
            ),
        [currentMonth, availabilityRules, availabilityExceptions]
    );

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

    const loadAvailability = useCallback(async () => {
        if (!isTrainer) {
            return;
        }

        setIsLoadingAvailability(true);

        try {
            const response = await availabilityApi.getMyAvailabilityRules();
            setAvailabilityRules(response.rules ?? []);
            setAvailabilityExceptions(response.exceptions ?? []);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить доступность"));
        } finally {
            setIsLoadingAvailability(false);
        }
    }, [isTrainer]);

    const loadDutySlots = useCallback(async () => {
        if (!isTrainer) {
            return;
        }

        setIsLoadingDutySlots(true);

        try {
            const data = await dutySlotApi.getMyDutySlots(monthRange.from, monthRange.to);
            setDutySlots(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить дежурные часы"));
        } finally {
            setIsLoadingDutySlots(false);
        }
    }, [isTrainer, monthRange.from, monthRange.to]);

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

    useEffect(() => {
        if (!isTrainer) {
            return;
        }

        void loadAvailability();
    }, [isTrainer, loadAvailability]);

    useEffect(() => {
        if (!isTrainer) {
            return;
        }

        void loadDutySlots();
    }, [isTrainer, loadDutySlots]);

    if (!currentUser) {
        return <div>Пользователь не загружен</div>;
    }

    if (!isTrainer) {
        return <ClientHomeFallback />;
    }

    const isCalendarLoading = isLoading || isLoadingAvailability || isLoadingDutySlots;

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

    const handleCreateDutySlot = async (startTime: string) => {
        const processingKey = `${selectedDate}-${startTime}`;
        setProcessingDutyKey(processingKey);
        setErrorMessage("");

        try {
            const created = await dutySlotApi.createMyDutySlot({
                dutyDate: selectedDate,
                startTime: `${startTime}:00`,
                endTime: plusOneHour(startTime),
            });

            setDutySlots((prev) => {
                const withoutDuplicate = prev.filter(
                    (item) =>
                        !(
                            item.dutyDate === created.dutyDate &&
                            item.startTime.slice(0, 5) === created.startTime.slice(0, 5)
                        )
                );

                return [...withoutDuplicate, created].sort((a, b) => {
                    const dateCompare = a.dutyDate.localeCompare(b.dutyDate);
                    if (dateCompare !== 0) {
                        return dateCompare;
                    }
                    return a.startTime.localeCompare(b.startTime);
                });
            });
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось отметить дежурство"));
        } finally {
            setProcessingDutyKey(null);
        }
    };

    const handleDeleteDutySlot = async (slotId: number, startTime: string) => {
        const processingKey = `${selectedDate}-${startTime}`;
        setProcessingDutyKey(processingKey);
        setErrorMessage("");

        try {
            await dutySlotApi.deleteMyDutySlot(slotId);
            setDutySlots((prev) => prev.filter((item) => item.id !== slotId));
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось снять дежурство"));
        } finally {
            setProcessingDutyKey(null);
        }
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

    const selectedDay = parseDateKey(selectedDate);

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div>
                    <p className="dashboard-kicker">Календарь</p>
                    <h1 className="dashboard-title">Календарь тренировок и доступности</h1>
                    <p className="dashboard-subtitle">
                        День теперь строится по реальной доступности, исключениям, уже созданным
                        тренировкам и дежурным часам.
                    </p>
                </div>

                <div className="dashboard-actions">
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-primary"
                        onClick={() => handleOpenCreate()}
                        disabled={isLoadingClients}
                    >
                        Добавить тренировку
                    </button>
                </div>
            </section>

            <section className="calendar-toolbar">
                <div className="calendar-toolbar__monthCard">
                    <button
                        type="button"
                        className="calendar-toolbar__navBtn"
                        onClick={handlePrevMonth}
                        aria-label="Предыдущий месяц"
                        title="Предыдущий месяц"
                    >
                        ‹
                    </button>

                    <div className="calendar-toolbar__center">
                        <div className="calendar-toolbar__label">Месяц</div>
                        <div className="calendar-toolbar__title">
                            {formatMonthTitle(currentMonth)}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="calendar-toolbar__navBtn"
                        onClick={handleNextMonth}
                        aria-label="Следующий месяц"
                        title="Следующий месяц"
                    >
                        ›
                    </button>
                </div>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary calendar-toolbar__todayBtn"
                    onClick={handleToday}
                >
                    Сегодня
                </button>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <section className="calendar-layout">
                <div className="calendar-layout__month">
                    {isCalendarLoading ? (
                        <div className="dashboard-card">Загрузка...</div>
                    ) : (
                        <div className="dashboard-card">
                            <DayPicker
                                locale={ru}
                                mode="single"
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
                                    hasAvailability: availabilityMarkers.daysWithAvailability,
                                    hasExceptions: availabilityMarkers.daysWithExceptions,
                                }}
                                modifiersClassNames={{
                                    hasTrainings: "coach-rdp-day-has-trainings",
                                    hasAvailability: "coach-rdp-day-has-availability",
                                    hasExceptions: "coach-rdp-day-has-exceptions",
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="calendar-layout__agenda">
                    <CalendarDayAgenda
                        selectedDate={selectedDate}
                        rows={agendaRows}
                        processingTrainingId={processingTrainingId}
                        processingDutyKey={processingDutyKey}
                        dutySlotsByStartTime={dutySlotsByStartTime}
                        onOpenTraining={(trainingId) => navigate(`/trainings/${trainingId}`)}
                        onQuickAdd={handleOpenCreate}
                        onCompleteTraining={handleQuickCompleteTraining}
                        onCancelTraining={handleQuickCancelTraining}
                        onRescheduleTraining={handleQuickRescheduleTraining}
                        onCreateDutySlot={handleCreateDutySlot}
                        onDeleteDutySlot={handleDeleteDutySlot}
                    />
                </div>
            </section>

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