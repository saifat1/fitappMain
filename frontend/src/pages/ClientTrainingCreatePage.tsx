import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import FbTextField from "../shared/ui/FbTextField";
import ChipToggleGroup from "../shared/ui/ChipToggleGroup";
import { trainingApi } from "../shared/api/trainingApi";
import { formatDateKey } from "../features/calendar/lib/trainerCalendar";
import { formatDaySubtitle } from "../features/calendar/lib/calendarWeek";
import { MUSCLE_GROUP_OPTIONS, type TrainingResponse } from "../features/training/model/training.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

/**
 * FIT-77: the client writes down a self-guided training for themselves. The trainer sees it in the calendar,
 * it doesn't go into the salary report. Exercises are added on the training screen right after.
 */
export default function ClientTrainingCreatePage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [focusMuscleGroups, setFocusMuscleGroups] = useState<string[]>([]);
    const [date, setDate] = useState(formatDateKey(new Date()));
    const [start, setStart] = useState("10:00");
    const [end, setEnd] = useState("11:00");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async () => {
        if (!date || !start || !end) {
            setErrorMessage("Укажите дату и время");
            return;
        }
        if (end <= start) {
            setErrorMessage("Время окончания должно быть позже начала");
            return;
        }
        setErrorMessage("");
        setIsSubmitting(true);
        try {
            const training: TrainingResponse = await trainingApi.createMyTraining({
                trainingDate: date,
                startTime: start,
                endTime: end,
                title: title.trim() || undefined,
                description: description.trim() || undefined,
                focusMuscleGroups,
            });
            navigate(`/trainings/${training.id}`, { replace: true });
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось записать тренировку"));
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
                <h1 className="fb-topbar__title">Своя тренировка</h1>
            </header>

            <div className="fb-body">
                <div className="fb-hint">
                    Самостоятельная тренировка — её увидит ваш тренер. Упражнения добавите на следующем шаге.
                </div>

                <FbTextField
                    id="ct-title"
                    label="Название"
                    placeholder="Например, «Бег» или «Зал: ноги»"
                    value={title}
                    onChange={setTitle}
                />

                <ChipToggleGroup
                    label="Группы мышц"
                    options={MUSCLE_GROUP_OPTIONS}
                    selected={focusMuscleGroups}
                    onChange={setFocusMuscleGroups}
                />

                <FbTextField id="ct-date" label="Дата" type="date" value={date} onChange={setDate} />
                <div className="fb-field-hint">{formatDaySubtitle(date)}</div>

                <FbTextField id="ct-start" label="Начало" type="time" value={start} onChange={setStart} />
                <FbTextField id="ct-end" label="Конец" type="time" value={end} onChange={setEnd} />

                <label className="fb-textarea">
                    <span className="fb-textarea__label">Описание</span>
                    <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                <button
                    type="button"
                    className="fb-btn fb-btn--primary fb-form-submit"
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Сохраняем…" : "Записать тренировку"}
                </button>
            </div>
        </div>
    );
}
