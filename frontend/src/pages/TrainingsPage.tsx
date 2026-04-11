import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { trainingApi } from "../shared/api/trainingApi";
import { trainerApi } from "../shared/api/trainerApi";
import { useAuth } from "../features/auth/model/AuthContext";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    CreateTrainingRequest,
    TrainingResponse,
} from "../features/training/model/training.types";
import type { TrainerClientResponse } from "../features/trainer/model/trainer.types";

function formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function getDefaultFromDate(): string {
    const date = new Date();
    date.setDate(1);
    return formatDateForInput(date);
}

function getDefaultToDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 0);
    return formatDateForInput(date);
}

function formatTimeRange(startTime: string | null, endTime: string | null): string {
    if (!startTime && !endTime) {
        return "Время не указано";
    }

    if (startTime && endTime) {
        return `${startTime} - ${endTime}`;
    }

    return startTime ?? endTime ?? "Время не указано";
}

function formatClientName(training: TrainingResponse): string {
    const fullName = [training.clientFirstName, training.clientLastName]
        .filter(Boolean)
        .join(" ");

    if (fullName) {
        return `${fullName} (${training.clientEmail})`;
    }

    return training.clientEmail;
}

function getStatusLabel(status: string): string {
    switch (status) {
        case "PLANNED":
            return "Запланирована";
        case "COMPLETED":
            return "Завершена";
        case "CANCELLED":
            return "Отменена";
        default:
            return status;
    }
}

function getStatusClass(status: string): string {
    switch (status) {
        case "PLANNED":
            return "training-status-badge planned";
        case "COMPLETED":
            return "training-status-badge completed";
        case "CANCELLED":
            return "training-status-badge cancelled";
        default:
            return "training-status-badge";
    }
}

export default function TrainingsPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [from, setFrom] = useState(getDefaultFromDate());
    const [to, setTo] = useState(getDefaultToDate());
    const [trainings, setTrainings] = useState<TrainingResponse[]>([]);
    const [clients, setClients] = useState<TrainerClientResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [clientId, setClientId] = useState("");
    const [trainingDate, setTrainingDate] = useState(formatDateForInput(new Date()));
    const [startTime, setStartTime] = useState("18:00");
    const [endTime, setEndTime] = useState("19:00");
    const [trainerNote, setTrainerNote] = useState("");

    const isTrainer = currentUser?.role === "TRAINER";

    async function loadTrainings() {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await trainingApi.getTrainings(from, to);
            setTrainings(data);

            if (isTrainer) {
                const trainerClients = await trainerApi.getClients();
                setClients(trainerClients);

                if (!clientId && trainerClients.length > 0) {
                    setClientId(String(trainerClients[0].id));
                }
            }
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось загрузить тренировки");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadTrainings();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await loadTrainings();
    };

    const handleCreateTraining = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!clientId) {
            setErrorMessage("Выбери клиента");
            return;
        }

        setErrorMessage("");
        setIsCreating(true);

        const payload: CreateTrainingRequest = {
            clientId: Number(clientId),
            trainingDate,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            trainerNote: trainerNote || undefined,
        };

        try {
            const created = await trainingApi.createTraining(payload);
            setTrainings((prev) => [created, ...prev]);
            setTrainerNote("");
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось создать тренировку");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsCreating(false);
        }
    };

    const stats = useMemo(() => {
        const planned = trainings.filter((item) => item.status === "PLANNED").length;
        const completed = trainings.filter((item) => item.status === "COMPLETED").length;
        const cancelled = trainings.filter((item) => item.status === "CANCELLED").length;

        return {
            total: trainings.length,
            planned,
            completed,
            cancelled,
        };
    }, [trainings]);

    return (
        <div className="trainings-page">
            <section className="trainings-hero">
                <div className="trainings-hero-main">
                    <div className="trainings-kicker">Тренировки</div>
                    <h1 className="trainings-title">
                        {isTrainer ? "Планирование и контроль занятий" : "Твои тренировки"}
                    </h1>
                    <p className="trainings-subtitle">
                        {isTrainer
                            ? "Создавай тренировки, фильтруй расписание и быстро переходи к деталям занятия по каждому клиенту."
                            : "Смотри свои тренировки в выбранном диапазоне и открывай детали каждого занятия."}
                    </p>
                </div>

                <div className="trainings-hero-stats">
                    <div className="trainings-stat-card">
                        <span>Всего в диапазоне</span>
                        <strong>{stats.total}</strong>
                    </div>
                    <div className="trainings-stat-card">
                        <span>Запланировано</span>
                        <strong>{stats.planned}</strong>
                    </div>
                    <div className="trainings-stat-card">
                        <span>Завершено</span>
                        <strong>{stats.completed}</strong>
                    </div>
                    <div className="trainings-stat-card">
                        <span>Отменено</span>
                        <strong>{stats.cancelled}</strong>
                    </div>
                </div>
            </section>

            {isTrainer && (
                <section className="trainings-panel trainings-panel-create">
                    <div className="trainings-panel-header">
                        <div>
                            <div className="trainings-panel-kicker">Создание</div>
                            <h2 className="trainings-panel-title">Новая тренировка</h2>
                        </div>
                    </div>

                    <form className="trainings-form" onSubmit={handleCreateTraining}>
                        <div className="trainings-form-grid">
                            <div className="form-row">
                                <label htmlFor="create-client">Клиент</label>
                                <select
                                    id="create-client"
                                    value={clientId}
                                    onChange={(event) => setClientId(event.target.value)}
                                    required
                                >
                                    {clients.length === 0 && <option value="">Нет клиентов</option>}
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.firstName || client.lastName
                                                ? `${client.firstName ?? ""} ${client.lastName ?? ""} (${client.email})`
                                                : client.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <label htmlFor="create-training-date">Дата</label>
                                <input
                                    id="create-training-date"
                                    type="date"
                                    value={trainingDate}
                                    onChange={(event) => setTrainingDate(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="create-start-time">Начало</label>
                                <input
                                    id="create-start-time"
                                    type="time"
                                    value={startTime}
                                    onChange={(event) => setStartTime(event.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="create-end-time">Окончание</label>
                                <input
                                    id="create-end-time"
                                    type="time"
                                    value={endTime}
                                    onChange={(event) => setEndTime(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label htmlFor="create-trainer-note">Заметка тренера</label>
                            <textarea
                                id="create-trainer-note"
                                value={trainerNote}
                                onChange={(event) => setTrainerNote(event.target.value)}
                                rows={4}
                                placeholder="Например: акцент на технику, ограничение по нагрузке, особенности занятия"
                            />
                        </div>

                        <div className="trainings-actions">
                            <button
                                type="submit"
                                className="dashboard-btn dashboard-btn-primary"
                                disabled={isCreating || clients.length === 0}
                            >
                                {isCreating ? "Создаём..." : "Создать тренировку"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="trainings-panel trainings-panel-filter">
                <div className="trainings-panel-header">
                    <div>
                        <div className="trainings-panel-kicker">Фильтр</div>
                        <h2 className="trainings-panel-title">Период отображения</h2>
                    </div>
                </div>

                <form className="trainings-filter-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label htmlFor="from-date">С даты</label>
                        <input
                            id="from-date"
                            type="date"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="to-date">По дату</label>
                        <input
                            id="to-date"
                            type="date"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                            required
                        />
                    </div>

                    <div className="trainings-filter-actions">
                        <button
                            type="submit"
                            className="dashboard-btn dashboard-btn-secondary"
                            disabled={isLoading}
                        >
                            {isLoading ? "Загружаем..." : "Применить"}
                        </button>
                    </div>
                </form>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            {isLoading && (
                <section className="trainings-panel">
                    <p>Загрузка...</p>
                </section>
            )}

            {!isLoading && !errorMessage && trainings.length === 0 && (
                <section className="trainings-panel">
                    <div className="trainings-empty">
                        <div className="trainings-empty-title">Тренировок в выбранном диапазоне нет</div>
                        <div className="trainings-empty-text">
                            Измени диапазон дат или создай новую тренировку.
                        </div>
                    </div>
                </section>
            )}

            {!isLoading && !errorMessage && trainings.length > 0 && (
                <section className="trainings-list">
                    {trainings.map((training) => (
                        <article key={training.id} className="training-card">
                            <div className="training-card-top">
                                <div>
                                    <div className="training-card-date">{training.trainingDate}</div>
                                    <h3 className="training-card-title">
                                        {isTrainer ? formatClientName(training) : `Тренировка #${training.id}`}
                                    </h3>
                                    <div className="training-card-time">
                                        {formatTimeRange(training.startTime, training.endTime)}
                                    </div>
                                </div>

                                <span className={getStatusClass(training.status)}>
                  {getStatusLabel(training.status)}
                </span>
                            </div>

                            <div className="training-card-grid">
                                <div className="training-card-item">
                                    <span>ID</span>
                                    <strong>{training.id}</strong>
                                </div>

                                {isTrainer && (
                                    <div className="training-card-item">
                                        <span>Клиент</span>
                                        <strong>{formatClientName(training)}</strong>
                                    </div>
                                )}

                                <div className="training-card-item training-card-item-wide">
                                    <span>Заметка тренера</span>
                                    <strong>{training.trainerNote?.trim() ? training.trainerNote : "Нет заметки"}</strong>
                                </div>
                            </div>

                            <div className="training-card-actions">
                                <button
                                    type="button"
                                    className="dashboard-btn dashboard-btn-primary"
                                    onClick={() => navigate(`/trainings/${training.id}`)}
                                >
                                    Открыть
                                </button>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </div>
    );
}