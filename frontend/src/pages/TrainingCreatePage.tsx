import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import FbTextField from "../shared/ui/FbTextField";
import ClientPickerSheet from "../features/training/ui/ClientPickerSheet";
import ExercisePickerSheet from "../features/training/ui/ExercisePickerSheet";
import { trainerApi } from "../shared/api/trainerApi";
import { trainingApi } from "../shared/api/trainingApi";
import { trainingExerciseApi } from "../shared/api/trainingExerciseApi";
import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";
import { formatDateKey } from "../features/calendar/lib/trainerCalendar";
import { formatDaySubtitle } from "../features/calendar/lib/calendarWeek";

import type { DraftExercise } from "../features/training/model/trainingDraft";
import type { TrainerClientResponse } from "../features/trainer/model/trainer.types";
import type { TrainingResponse } from "../features/training/model/training.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function plusOneHour(value: string): string {
    const [h, m] = value.split(":").map(Number);
    return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function clientName(client: TrainerClientResponse): string {
    const full = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
    return full || client.email;
}

type LocationState = { date?: string; startTime?: string; clientId?: number } | null;

export default function TrainingCreatePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const defaultStart = state?.startTime ?? "12:00";

    const [clients, setClients] = useState<TrainerClientResponse[]>([]);
    const [clientId, setClientId] = useState<number | null>(state?.clientId ?? null);
    const [date, setDate] = useState(state?.date ?? formatDateKey(new Date()));
    const [start, setStart] = useState(defaultStart);
    const [end, setEnd] = useState(plusOneHour(defaultStart));
    const [comment, setComment] = useState("");
    const [exercises, setExercises] = useState<DraftExercise[]>([]);

    const [clientSheetOpen, setClientSheetOpen] = useState(false);
    const [exerciseSheetOpen, setExerciseSheetOpen] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await trainerApi.getClients();
                if (active) setClients(data);
            } catch (error) {
                if (active) setErrorMessage(resolveApiError(error, "Не удалось загрузить клиентов"));
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const selectedClient = useMemo(
        () => clients.find((c) => c.id === clientId) ?? null,
        [clients, clientId]
    );

    const removeExercise = (key: string) => {
        setExercises((prev) => prev.filter((item) => item.key !== key));
    };

    const handleSave = async () => {
        if (!clientId) {
            setErrorMessage("Выберите клиента");
            return;
        }
        if (end <= start) {
            setErrorMessage("Время окончания должно быть позже начала");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const training: TrainingResponse = await trainingApi.createTraining({
                clientId,
                trainingDate: date,
                startTime: start,
                endTime: end,
                trainerNote: comment.trim() || undefined,
            });

            // Attach queued exercises in order.
            for (const exercise of exercises) {
                if (exercise.source.kind === "template") {
                    await exerciseTemplateApi.addTemplateToTraining(training.id, {
                        templateId: exercise.source.templateId,
                    });
                } else {
                    await trainingExerciseApi.createExercise(training.id, exercise.source.payload);
                }
            }

            navigate(`/trainings/${training.id}`);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось создать тренировку"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">Тренировка</h1>
            </header>

            <div className="fb-body">
                <button type="button" className="fb-select" onClick={() => setClientSheetOpen(true)}>
                    <span className="fb-select__label">Клиент</span>
                    <span className="fb-select__control">
                        <span className={selectedClient ? "fb-select__value" : "fb-select__placeholder"}>
                            {selectedClient ? clientName(selectedClient) : "Не выбран"}
                        </span>
                        <span className="fb-select__chevron">›</span>
                    </span>
                </button>

                <FbTextField id="tr-date" label="Дата" type="date" value={date} onChange={setDate} />
                <div className="fb-field-hint">{formatDaySubtitle(date)}</div>

                <FbTextField id="tr-start" label="Начало" type="time" value={start} onChange={setStart} />
                <FbTextField id="tr-end" label="Конец" type="time" value={end} onChange={setEnd} />

                {/* Повтор пока без бэкенда — статичная строка */}
                <div className="fb-select fb-select--static">
                    <span className="fb-select__label">Повтор</span>
                    <span className="fb-select__control">
                        <span className="fb-select__value">Никогда</span>
                    </span>
                </div>

                <label className="fb-textarea">
                    <span className="fb-textarea__label">Комментарий</span>
                    <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
                </label>

                <div className="fb-section-title fb-section-title--flush">Упражнения</div>

                {exercises.length > 0 && (
                    <div className="fb-list">
                        {exercises.map((exercise) => (
                            <div key={exercise.key} className="fb-row">
                                <span className="fb-row__main">
                                    <span className="fb-row__title">{exercise.title}</span>
                                    <span className="fb-row__sub">{exercise.summary}</span>
                                </span>
                                <button
                                    type="button"
                                    className="fb-row__remove"
                                    aria-label="Убрать упражнение"
                                    onClick={() => removeExercise(exercise.key)}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button type="button" className="fb-add-link" onClick={() => setExerciseSheetOpen(true)}>
                    + Добавить упражнение
                </button>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                <button
                    type="button"
                    className="fb-btn fb-btn--primary fb-form-submit"
                    onClick={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Сохраняем…" : "Сохранить"}
                </button>
            </div>

            {clientSheetOpen && (
                <ClientPickerSheet
                    clients={clients}
                    selectedId={clientId}
                    onSelect={setClientId}
                    onClose={() => setClientSheetOpen(false)}
                />
            )}

            {exerciseSheetOpen && (
                <ExercisePickerSheet
                    onPick={(draft) => setExercises((prev) => [...prev, draft])}
                    onClose={() => setExerciseSheetOpen(false)}
                />
            )}
        </div>
    );
}
