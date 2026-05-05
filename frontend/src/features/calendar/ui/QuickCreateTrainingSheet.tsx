import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { TrainerClientResponse } from "../../trainer/model/trainer.types";

type Props = {
    isOpen: boolean;
    selectedDate: string;
    selectedStartTime?: string;
    clients: TrainerClientResponse[];
    isSubmitting: boolean;
    onSubmit: (payload: {
        clientId: number;
        trainingDate: string;
        startTime?: string;
        endTime?: string;
        trainerNote?: string;
    }) => Promise<void>;
    onClose: () => void;
};

function plusOneHour(value?: string): string {
    if (!value) {
        return "19:00";
    }

    const [hours, minutes] = value.split(":").map(Number);
    const nextHour = (hours + 1) % 24;
    return `${String(nextHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatClientOption(client: TrainerClientResponse): string {
    const fullName = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
    return fullName || client.email;
}

export default function QuickCreateTrainingSheet({
                                                     isOpen,
                                                     selectedDate,
                                                     selectedStartTime,
                                                     clients,
                                                     isSubmitting,
                                                     onSubmit,
                                                     onClose,
                                                 }: Props) {
    const [clientId, setClientId] = useState("");
    const [trainingDate, setTrainingDate] = useState(selectedDate);
    const [startTime, setStartTime] = useState(selectedStartTime ?? "18:00");
    const [endTime, setEndTime] = useState(plusOneHour(selectedStartTime));
    const [trainerNote, setTrainerNote] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setTrainingDate(selectedDate);
        setStartTime(selectedStartTime ?? "18:00");
        setEndTime(plusOneHour(selectedStartTime));
        setTrainerNote("");
        setErrorMessage("");

        if (clients.length > 0) {
            setClientId(String(clients[0].id));
        }
    }, [isOpen, selectedDate, selectedStartTime, clients]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!clientId) {
            setErrorMessage("Выбери клиента");
            return;
        }

        if (!startTime || !endTime) {
            setErrorMessage("Укажи время начала и окончания");
            return;
        }

        if (endTime <= startTime) {
            setErrorMessage("Время окончания должно быть позже времени начала");
            return;
        }

        setErrorMessage("");

        await onSubmit({
            clientId: Number(clientId),
            trainingDate,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            trainerNote: trainerNote.trim() || undefined,
        });
    };

    return (
        <>
            <div className="coach-create-sheet-overlay" onClick={onClose} />

            <section className="coach-create-sheet entity-panel-compact">
                <div className="coach-create-sheet-head">
                    <h3 className="coach-create-sheet-title">Новая тренировка</h3>

                    <button
                        type="button"
                        className="card-action-btn card-action-btn-neutral"
                        onClick={onClose}
                        title="Закрыть"
                    >
                        ×
                    </button>
                </div>

                <form className="coach-create-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label htmlFor="calendar-client">Клиент</label>
                        <select
                            id="calendar-client"
                            value={clientId}
                            onChange={(event) => setClientId(event.target.value)}
                            required
                        >
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {formatClientOption(client)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="coach-create-grid">
                        <div className="form-row">
                            <label htmlFor="calendar-date">Дата</label>
                            <input
                                id="calendar-date"
                                type="date"
                                value={trainingDate}
                                onChange={(event) => setTrainingDate(event.target.value)}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="calendar-start">Начало</label>
                            <input
                                id="calendar-start"
                                type="time"
                                value={startTime}
                                onChange={(event) => setStartTime(event.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="calendar-end">Окончание</label>
                            <input
                                id="calendar-end"
                                type="time"
                                value={endTime}
                                onChange={(event) => setEndTime(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <label htmlFor="calendar-note">Заметка</label>
                        <textarea
                            id="calendar-note"
                            rows={2}
                            value={trainerNote}
                            onChange={(event) => setTrainerNote(event.target.value)}
                        />
                    </div>

                    {errorMessage && <div className="error-box">{errorMessage}</div>}

                    <div className="coach-create-actions">
                        <button
                            type="submit"
                            className="dashboard-btn dashboard-btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Создаём..." : "Создать"}
                        </button>

                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </section>
        </>
    );
}