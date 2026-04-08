import { useEffect, useState } from "react";
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
        return "-";
    }

    if (startTime && endTime) {
        return `${startTime} - ${endTime}`;
    }

    return startTime ?? endTime ?? "-";
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

    return (
        <div className="page-card page-card-wide">
            <div className="page-header-row">
                <div>
                    <h2>Тренировки</h2>
                    <p className="page-description">
                        {isTrainer
                            ? "Список тренировок твоих клиентов в выбранном диапазоне."
                            : "Список твоих тренировок в выбранном диапазоне."}
                    </p>
                </div>
            </div>

            {isTrainer && (
                <form className="form section-block training-create-block" onSubmit={handleCreateTraining}>
                    <h3>Создать тренировку</h3>

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

                    <div className="form-row">
                        <label htmlFor="create-trainer-note">Заметка тренера</label>
                        <textarea
                            id="create-trainer-note"
                            value={trainerNote}
                            onChange={(event) => setTrainerNote(event.target.value)}
                            rows={3}
                        />
                    </div>

                    <button type="submit" disabled={isCreating || clients.length === 0}>
                        {isCreating ? "Создаём..." : "Создать тренировку"}
                    </button>
                </form>
            )}

            <form className="filter-form section-block" onSubmit={handleSubmit}>
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

                <div className="filter-actions">
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Загружаем..." : "Загрузить"}
                    </button>
                </div>
            </form>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            {isLoading && <p>Загрузка...</p>}

            {!isLoading && !errorMessage && trainings.length === 0 && (
                <p>Тренировок в выбранном диапазоне нет.</p>
            )}

            {!isLoading && !errorMessage && trainings.length > 0 && (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Дата</th>
                            <th>Время</th>
                            {isTrainer && <th>Клиент</th>}
                            <th>Статус</th>
                            <th>Заметка тренера</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {trainings.map((training) => (
                            <tr key={training.id}>
                                <td>{training.id}</td>
                                <td>{training.trainingDate}</td>
                                <td>{formatTimeRange(training.startTime, training.endTime)}</td>
                                {isTrainer && <td>{formatClientName(training)}</td>}
                                <td>{training.status}</td>
                                <td>{training.trainerNote ?? "-"}</td>
                                <td>
                                    <button onClick={() => navigate(`/trainings/${training.id}`)}>
                                        Открыть
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}