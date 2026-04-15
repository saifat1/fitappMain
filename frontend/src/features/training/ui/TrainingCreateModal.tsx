import type { FormEvent } from "react";
import type { TrainerClientResponse } from "../../trainer/model/trainer.types";
import { formatClientOption } from "../lib/trainingFormat";

type Props = {
    isOpen: boolean;
    isSubmitting: boolean;
    clients: TrainerClientResponse[];

    clientId: string;
    trainingDate: string;
    startTime: string;
    endTime: string;
    trainerNote: string;

    onChangeClientId: (v: string) => void;
    onChangeDate: (v: string) => void;
    onChangeStartTime: (v: string) => void;
    onChangeEndTime: (v: string) => void;
    onChangeNote: (v: string) => void;

    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onClose: () => void;
};

export default function TrainingCreateModal({
                                                isOpen,
                                                isSubmitting,
                                                clients,
                                                clientId,
                                                trainingDate,
                                                startTime,
                                                endTime,
                                                trainerNote,
                                                onChangeClientId,
                                                onChangeDate,
                                                onChangeStartTime,
                                                onChangeEndTime,
                                                onChangeNote,
                                                onSubmit,
                                                onClose,
                                            }: Props) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Новая тренировка</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form className="trainings-form" onSubmit={onSubmit}>
                    <div className="trainings-form-grid">
                        <div className="form-row">
                            <label>Клиент</label>
                            <select
                                value={clientId}
                                onChange={(e) => onChangeClientId(e.target.value)}
                                required
                            >
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {formatClientOption(c)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <label>Дата</label>
                            <input
                                type="date"
                                value={trainingDate}
                                onChange={(e) => onChangeDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label>Начало</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => onChangeStartTime(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <label>Окончание</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => onChangeEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <label>Заметка</label>
                        <textarea
                            value={trainerNote}
                            onChange={(e) => onChangeNote(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="trainings-actions">
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={onClose}
                        >
                            Отмена
                        </button>

                        <button
                            type="submit"
                            className="dashboard-btn dashboard-btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Создаём..." : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}