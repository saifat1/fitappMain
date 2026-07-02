import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../features/auth/model/AuthContext";
import { trainingApi } from "../shared/api/trainingApi";
import { dutySlotApi } from "../shared/api/dutySlotApi";
import TrainerCalendarScreen from "../features/calendar/ui/TrainerCalendarScreen";
import {
    getDefaultSelectedDate,
    getMonthRange,
    getMonthStart,
    parseDateKey,
    shiftMonth,
} from "../features/calendar/lib/trainerCalendar";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { TrainingResponse } from "../features/training/model/training.types";
import type { TrainerDutySlotResponse } from "../features/duty-slot/model/dutySlot.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
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
    const [selectedDate, setSelectedDate] = useState(getDefaultSelectedDate(new Date()));

    const [trainings, setTrainings] = useState<TrainingResponse[]>([]);
    const [dutySlots, setDutySlots] = useState<TrainerDutySlotResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSavingDuty, setIsSavingDuty] = useState(false);
    const [processingDutyKey, setProcessingDutyKey] = useState<string | null>(null);

    const isTrainer = currentUser?.role === "TRAINER";

    const loadTrainings = useCallback(async () => {
        const range = getMonthRange(currentMonth);
        setIsLoading(true);
        setErrorMessage("");

        try {
            const [trainingsData, dutySlotsData] = await Promise.all([
                trainingApi.getTrainings(range.from, range.to),
                dutySlotApi.getMyDutySlots(range.from, range.to),
            ]);
            setTrainings(trainingsData);
            setDutySlots(dutySlotsData);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить календарь"));
        } finally {
            setIsLoading(false);
        }
    }, [currentMonth]);

    const loadDutySlotsOnly = useCallback(async () => {
        const range = getMonthRange(currentMonth);
        const data = await dutySlotApi.getMyDutySlots(range.from, range.to);
        setDutySlots(data);
    }, [currentMonth]);

    useEffect(() => {
        if (!isTrainer) {
            return;
        }

        void loadTrainings();
    }, [isTrainer, loadTrainings]);

    if (!currentUser) {
        return <div>Пользователь не загружен</div>;
    }

    if (!isTrainer) {
        return <ClientHomeFallback />;
    }

    const handleSelectDate = (dateKey: string) => {
        setSelectedDate(dateKey);

        const targetMonth = getMonthStart(parseDateKey(dateKey));
        if (
            targetMonth.getMonth() !== currentMonth.getMonth() ||
            targetMonth.getFullYear() !== currentMonth.getFullYear()
        ) {
            setCurrentMonth(targetMonth);
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

    const handleCreateDutyRange = async (startHour: number, hours: number): Promise<boolean> => {
        setIsSavingDuty(true);
        setErrorMessage("");

        try {
            for (let offset = 0; offset < hours; offset += 1) {
                const hour = startHour + offset;
                const pad = (value: number) => String(value).padStart(2, "0");

                await dutySlotApi.createMyDutySlot({
                    dutyDate: selectedDate,
                    startTime: `${pad(hour)}:00`,
                    endTime: `${pad(hour + 1)}:00`,
                });
            }

            await loadDutySlotsOnly();
            return true;
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось добавить дежурство"));
            await loadDutySlotsOnly();
            return false;
        } finally {
            setIsSavingDuty(false);
        }
    };

    const handleDeleteDutyBlock = async (slotIds: number[], label: string) => {
        if (!window.confirm(`Снять дежурство ${label}?`)) {
            return;
        }

        const dutyKey = `${selectedDate}-${label.split("–")[0]}`;
        setProcessingDutyKey(dutyKey);
        setErrorMessage("");

        try {
            for (const slotId of slotIds) {
                await dutySlotApi.deleteMyDutySlot(slotId);
            }
            await loadDutySlotsOnly();
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось снять дежурство"));
            await loadDutySlotsOnly();
        } finally {
            setProcessingDutyKey(null);
        }
    };

    return (
        <TrainerCalendarScreen
            currentUser={currentUser}
            trainings={trainings}
            dutySlots={dutySlots}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            isLoading={isLoading}
            errorMessage={errorMessage || undefined}
            processingDutyKey={processingDutyKey}
            isSavingDuty={isSavingDuty}
            onSelectDate={handleSelectDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onOpenTraining={(trainingId) => navigate(`/trainings/${trainingId}`)}
            onQuickAdd={(startTime) =>
                navigate("/trainings/new", {
                    state: { date: selectedDate, startTime },
                })
            }
            onCreateDutyRange={handleCreateDutyRange}
            onDeleteDutyBlock={handleDeleteDutyBlock}
            onOpenProfile={() => navigate("/trainer/profile")}
        />
    );
}
