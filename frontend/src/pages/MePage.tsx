import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../features/auth/model/AuthContext";
import { trainingApi } from "../shared/api/trainingApi";
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
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const isTrainer = currentUser?.role === "TRAINER";

    const loadTrainings = useCallback(async () => {
        const range = getMonthRange(currentMonth);
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await trainingApi.getTrainings(range.from, range.to);
            setTrainings(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить календарь"));
        } finally {
            setIsLoading(false);
        }
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

    return (
        <TrainerCalendarScreen
            currentUser={currentUser}
            trainings={trainings}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            isLoading={isLoading}
            errorMessage={errorMessage || undefined}
            onSelectDate={handleSelectDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onOpenTraining={(trainingId) => navigate(`/trainings/${trainingId}`)}
            onQuickAdd={(startTime) =>
                navigate("/trainings/new", {
                    state: { date: selectedDate, startTime },
                })
            }
            onOpenProfile={() => navigate("/trainer/profile")}
        />
    );
}
