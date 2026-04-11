import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { trainingApi } from "../shared/api/trainingApi";
import { useAuth } from "../features/auth/model/AuthContext";
import { trainingExerciseApi } from "../shared/api/trainingExerciseApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import ExerciseTimerPanel from "../features/timer/ui/ExerciseTimerPanel";
import RestTimerPanel from "../features/timer/ui/RestTimerPanel";
import WorkoutFlowPanel from "../features/timer/ui/WorkoutFlowPanel";
import type {
    TrainingResponse,
    UpdateTrainingRequest,
} from "../features/training/model/training.types";
import type {
    CreateTrainingExerciseRequest,
    TrainingExerciseResponse,
    UpdateTrainingExerciseRequest,
} from "../features/training-exercise/model/trainingExercise.types";

function formatClientName(training: TrainingResponse): string {
    const fullName = [training.clientFirstName, training.clientLastName]
        .filter(Boolean)
        .join(" ");

    if (fullName) {
        return `${fullName} (${training.clientEmail})`;
    }

    return training.clientEmail;
}

function formatExerciseLoad(exercise: TrainingExerciseResponse): string {
    const parts: string[] = [];

    if (exercise.sets != null) parts.push(`подходы: ${exercise.sets}`);
    if (exercise.reps != null) parts.push(`повторы: ${exercise.reps}`);
    if (exercise.durationSeconds != null) {
        parts.push(`длительность: ${exercise.durationSeconds} сек`);
    }
    if (exercise.restSeconds != null) parts.push(`отдых: ${exercise.restSeconds} сек`);

    return parts.length > 0 ? parts.join(", ") : "Параметры не заданы";
}

function getTrainingStatusLabel(status: string): string {
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

function getTrainingStatusClass(status: string): string {
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

type ExerciseFormState = {
    title: string;
    description: string;
    sets: string;
    reps: string;
    durationSeconds: string;
    restSeconds: string;
    trainerNote: string;
};

const emptyExerciseForm: ExerciseFormState = {
    title: "",
    description: "",
    sets: "",
    reps: "",
    durationSeconds: "",
    restSeconds: "",
    trainerNote: "",
};

export default function TrainingDetailsPage() {
    const { trainingId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [training, setTraining] = useState<TrainingResponse | null>(null);
    const [exercises, setExercises] = useState<TrainingExerciseResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingExercises, setIsLoadingExercises] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [savingExerciseId, setSavingExerciseId] = useState<number | null>(null);
    const [deletingExerciseId, setDeletingExerciseId] = useState<number | null>(null);
    const [editingExerciseId, setEditingExerciseId] = useState<number | null>(null);
    const [togglingExerciseId, setTogglingExerciseId] = useState<number | null>(null);
    const [savingTrainerNoteId, setSavingTrainerNoteId] = useState<number | null>(null);
    const [savingClientNoteId, setSavingClientNoteId] = useState<number | null>(null);

    const [errorMessage, setErrorMessage] = useState("");
    const [exerciseErrorMessage, setExerciseErrorMessage] = useState("");

    const [trainingDate, setTrainingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [status, setStatus] = useState("");
    const [trainerNote, setTrainerNote] = useState("");

    const [createExerciseForm, setCreateExerciseForm] =
        useState<ExerciseFormState>(emptyExerciseForm);
    const [editExerciseForm, setEditExerciseForm] =
        useState<ExerciseFormState>(emptyExerciseForm);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

    const [trainerNotesDraft, setTrainerNotesDraft] = useState<Record<number, string>>({});
    const [clientNotesDraft, setClientNotesDraft] = useState<Record<number, string>>({});

    const isTrainer = currentUser?.role === "TRAINER";
    const isClient = currentUser?.role === "CLIENT";

    async function loadExercises() {
        if (!trainingId) {
            setExerciseErrorMessage("Не указан id тренировки");
            setIsLoadingExercises(false);
            return;
        }

        setExerciseErrorMessage("");
        setIsLoadingExercises(true);

        try {
            const data = await trainingExerciseApi.getExercises(Number(trainingId));
            setExercises(data);

            const trainerDrafts: Record<number, string> = {};
            const clientDrafts: Record<number, string> = {};

            data.forEach((exercise) => {
                trainerDrafts[exercise.id] = exercise.trainerNote ?? "";
                clientDrafts[exercise.id] = exercise.clientNote ?? "";
            });

            setTrainerNotesDraft(trainerDrafts);
            setClientNotesDraft(clientDrafts);
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setExerciseErrorMessage(
                    error.response?.data?.message ?? "Не удалось загрузить упражнения"
                );
            } else {
                setExerciseErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsLoadingExercises(false);
        }
    }

    useEffect(() => {
        async function loadTraining() {
            if (!trainingId) {
                setErrorMessage("Не указан id тренировки");
                setIsLoading(false);
                return;
            }

            setErrorMessage("");
            setIsLoading(true);

            try {
                const trainingData = await trainingApi.getTraining(Number(trainingId));
                setTraining(trainingData);

                setTrainingDate(trainingData.trainingDate);
                setStartTime(trainingData.startTime ?? "");
                setEndTime(trainingData.endTime ?? "");
                setStatus(trainingData.status);
                setTrainerNote(trainingData.trainerNote ?? "");
            } catch (error) {
                if (axios.isAxiosError<ApiErrorResponse>(error)) {
                    setErrorMessage(error.response?.data?.message ?? "Не удалось загрузить тренировку");
                } else {
                    setErrorMessage("Неизвестная ошибка");
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadTraining();
    }, [trainingId]);

    useEffect(() => {
        loadExercises();
    }, [trainingId]);

    useEffect(() => {
        if (exercises.length === 0) {
            setActiveExerciseIndex(0);
            return;
        }

        if (activeExerciseIndex > exercises.length - 1) {
            setActiveExerciseIndex(exercises.length - 1);
        }
    }, [exercises, activeExerciseIndex]);

    const completedCount = useMemo(
        () => exercises.filter((item) => item.isCompleted).length,
        [exercises]
    );

    const progressPercent =
        exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!training) return;

        setErrorMessage("");
        setIsSaving(true);

        const payload: UpdateTrainingRequest = {
            trainingDate,
            startTime: startTime || undefined,
            endTime: endTime || undefined,
            status,
            trainerNote,
        };

        try {
            const updated = await trainingApi.updateTraining(training.id, payload);
            setTraining(updated);
            setIsEditing(false);
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось обновить тренировку");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelTraining = async () => {
        if (!training) return;

        const confirmed = window.confirm("Отменить тренировку?");
        if (!confirmed) return;

        setErrorMessage("");
        setIsCancelling(true);

        try {
            await trainingApi.cancelTraining(training.id);
            const reloaded = await trainingApi.getTraining(training.id);
            setTraining(reloaded);
            setStatus(reloaded.status);
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Не удалось отменить тренировку");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsCancelling(false);
        }
    };

    const buildExercisePayload = (
        form: ExerciseFormState
    ): CreateTrainingExerciseRequest => ({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        sets: form.sets.trim() ? Number(form.sets) : undefined,
        reps: form.reps.trim() ? Number(form.reps) : undefined,
        durationSeconds: form.durationSeconds.trim()
            ? Number(form.durationSeconds)
            : undefined,
        restSeconds: form.restSeconds.trim() ? Number(form.restSeconds) : undefined,
        trainerNote: form.trainerNote.trim() || undefined,
    });

    const handleCreateExercise = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!trainingId) return;

        setExerciseErrorMessage("");
        setIsCreatingExercise(true);

        try {
            const created = await trainingExerciseApi.createExercise(
                Number(trainingId),
                buildExercisePayload(createExerciseForm)
            );
            setExercises((prev) => [...prev, created]);
            setCreateExerciseForm(emptyExerciseForm);
            setTrainerNotesDraft((prev) => ({ ...prev, [created.id]: created.trainerNote ?? "" }));
            setClientNotesDraft((prev) => ({ ...prev, [created.id]: created.clientNote ?? "" }));
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setExerciseErrorMessage(
                    error.response?.data?.message ?? "Не удалось создать упражнение"
                );
            } else {
                setExerciseErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsCreatingExercise(false);
        }
    };

    const startEditExercise = (exercise: TrainingExerciseResponse) => {
        setEditingExerciseId(exercise.id);
        setEditExerciseForm({
            title: exercise.title ?? "",
            description: exercise.description ?? "",
            sets: exercise.sets != null ? String(exercise.sets) : "",
            reps: exercise.reps != null ? String(exercise.reps) : "",
            durationSeconds:
                exercise.durationSeconds != null ? String(exercise.durationSeconds) : "",
            restSeconds: exercise.restSeconds != null ? String(exercise.restSeconds) : "",
            trainerNote: exercise.trainerNote ?? "",
        });
    };

    const cancelEditExercise = () => {
        setEditingExerciseId(null);
        setEditExerciseForm(emptyExerciseForm);
    };

    const handleSaveExercise = async (exerciseId: number) => {
        if (!trainingId) return;

        setExerciseErrorMessage("");
        setSavingExerciseId(exerciseId);

        const payload: UpdateTrainingExerciseRequest = {
            title: editExerciseForm.title.trim(),
            description: editExerciseForm.description.trim() || undefined,
            sets: editExerciseForm.sets.trim() ? Number(editExerciseForm.sets) : undefined,
            reps: editExerciseForm.reps.trim() ? Number(editExerciseForm.reps) : undefined,
            durationSeconds: editExerciseForm.durationSeconds.trim()
                ? Number(editExerciseForm.durationSeconds)
                : undefined,
            restSeconds: editExerciseForm.restSeconds.trim()
                ? Number(editExerciseForm.restSeconds)
                : undefined,
            trainerNote: editExerciseForm.trainerNote.trim() || undefined,
        };

        try {
            const updated = await trainingExerciseApi.updateExercise(
                Number(trainingId),
                exerciseId,
                payload
            );

            setExercises((prev) =>
                prev.map((exercise) => (exercise.id === exerciseId ? updated : exercise))
            );
            setTrainerNotesDraft((prev) => ({ ...prev, [updated.id]: updated.trainerNote ?? "" }));
            setClientNotesDraft((prev) => ({ ...prev, [updated.id]: updated.clientNote ?? "" }));
            cancelEditExercise();
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setExerciseErrorMessage(
                    error.response?.data?.message ?? "Не удалось обновить упражнение"
                );
            } else {
                setExerciseErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setSavingExerciseId(null);
        }
    };

    const handleDeleteExercise = async (exerciseId: number) => {
        if (!trainingId) return;

        const confirmed = window.confirm("Удалить упражнение?");
        if (!confirmed) return;

        setExerciseErrorMessage("");
        setDeletingExerciseId(exerciseId);

        try {
            await trainingExerciseApi.deleteExercise(Number(trainingId), exerciseId);
            setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));
            setTrainerNotesDraft((prev) => {
                const copy = { ...prev };
                delete copy[exerciseId];
                return copy;
            });
            setClientNotesDraft((prev) => {
                const copy = { ...prev };
                delete copy[exerciseId];
                return copy;
            });
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setExerciseErrorMessage(
                    error.response?.data?.message ?? "Не удалось удалить упражнение"
                );
            } else {
                setExerciseErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setDeletingExerciseId(null);
        }
    };

    const handleToggleCompletion = async (
        exercise: TrainingExerciseResponse,
        nextValue: boolean
    ) => {
        if (!trainingId) return;

        setExerciseErrorMessage("");
        setTogglingExerciseId(exercise.id);

        try {
            const updated = await trainingExerciseApi.updateCompletion(
                Number(trainingId),
                exercise.id,
                { isCompleted: nextValue }
            );

            setExercises((prev) =>
                prev.map((item) => (item.id === exercise.id ? updated : item))
            );
            setTrainerNotesDraft((prev) => ({ ...prev, [updated.id]: updated.trainerNote ?? "" }));
            setClientNotesDraft((prev) => ({ ...prev, [updated.id]: updated.clientNote ?? "" }));
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setExerciseErrorMessage(
                    error.response?.data?.message ?? "Не удалось обновить выполнение"
                );
            } else {
                setExerciseErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setTogglingExerciseId(null);
        }
    };

    const handleSaveTrainerNote = async (exerciseId: number) => {
        if (!trainingId) return;

        setExerciseErrorMessage("");
        setSavingTrainerNoteId(exerciseId);

        try {
            const updated = await trainingExerciseApi.updateExercise(
                Number(trainingId),
                exerciseId,
                { trainerNote: trainerNotesDraft[exerciseId] ?? "" }
            );

            setExercises((prev) =>
                prev.map((item) => (item.id === exerciseId ? updated : item))
            );
            setTrainerNotesDraft((prev) => ({ ...prev, [updated.id]: updated.trainerNote ?? "" }));
            setClientNotesDraft((prev) => ({ ...prev, [updated.id]: updated.clientNote ?? "" }));
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setExerciseErrorMessage(
                    error.response?.data?.message ?? "Не удалось сохранить заметку тренера"
                );
            } else {
                setExerciseErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setSavingTrainerNoteId(null);
        }
    };

    const handleSaveClientNote = async (exerciseId: number) => {
        if (!trainingId) return;

        setExerciseErrorMessage("");
        setSavingClientNoteId(exerciseId);

        try {
            const updated = await trainingExerciseApi.updateExercise(
                Number(trainingId),
                exerciseId,
                { clientNote: clientNotesDraft[exerciseId] ?? "" }
            );

            setExercises((prev) =>
                prev.map((item) => (item.id === exerciseId ? updated : item))
            );
            setTrainerNotesDraft((prev) => ({ ...prev, [updated.id]: updated.trainerNote ?? "" }));
            setClientNotesDraft((prev) => ({ ...prev, [updated.id]: updated.clientNote ?? "" }));
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setExerciseErrorMessage(
                    error.response?.data?.message ?? "Не удалось сохранить заметку клиента"
                );
            } else {
                setExerciseErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setSavingClientNoteId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="training-details-page">
                <section className="training-details-panel">
                    <p>Загрузка...</p>
                </section>
            </div>
        );
    }

    if (errorMessage && !training) {
        return (
            <div className="training-details-page">
                <section className="training-details-panel">
                    <div className="error-box">{errorMessage}</div>
                    <div className="details-actions top-gap">
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => navigate("/trainings")}
                        >
                            Назад к тренировкам
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    if (!training) {
        return (
            <div className="training-details-page">
                <section className="training-details-panel">
                    <p>Тренировка не найдена.</p>
                    <div className="details-actions top-gap">
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => navigate("/trainings")}
                        >
                            Назад к тренировкам
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="training-details-page">
            <section className="training-details-hero">
                <div className="training-details-hero-main">
                    <div className="training-details-kicker">Тренировка #{training.id}</div>
                    <h1 className="training-details-title">
                        {isTrainer ? formatClientName(training) : "Детали тренировки"}
                    </h1>
                    <p className="training-details-subtitle">
                        {training.trainingDate}
                        {training.startTime || training.endTime
                            ? ` · ${training.startTime ?? "--:--"} — ${training.endTime ?? "--:--"}`
                            : ""}
                    </p>

                    <div className="training-details-hero-actions">
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => navigate("/trainings")}
                        >
                            Назад к тренировкам
                        </button>

                        {isTrainer && !isEditing && (
                            <>
                                <button
                                    type="button"
                                    className="dashboard-btn dashboard-btn-primary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Редактировать
                                </button>
                                <button
                                    type="button"
                                    className="dashboard-btn dashboard-btn-secondary"
                                    onClick={handleCancelTraining}
                                    disabled={isCancelling || training.status === "CANCELLED"}
                                >
                                    {isCancelling ? "Отменяем..." : "Отменить тренировку"}
                                </button>
                            </>
                        )}

                        {isClient && training.status !== "CANCELLED" && (
                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-primary"
                                onClick={() => navigate(`/trainings/${training.id}/reschedule-request`)}
                            >
                                Запросить перенос
                            </button>
                        )}
                    </div>
                </div>

                <div className="training-details-summary">
                    <div className="training-details-summary-top">
            <span className={getTrainingStatusClass(training.status)}>
              {getTrainingStatusLabel(training.status)}
            </span>
                    </div>

                    <div className="training-details-summary-grid">
                        <div className="training-summary-item">
                            <span>Упражнений</span>
                            <strong>{exercises.length}</strong>
                        </div>
                        <div className="training-summary-item">
                            <span>Выполнено</span>
                            <strong>{completedCount}</strong>
                        </div>
                        <div className="training-summary-item">
                            <span>Прогресс</span>
                            <strong>{progressPercent}%</strong>
                        </div>
                    </div>

                    <div className="training-progress">
                        <div className="training-progress-bar">
                            <div
                                className="training-progress-fill"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="training-note-preview">
                        <div className="training-note-preview-label">Заметка тренера</div>
                        <div className="training-note-preview-text">
                            {training.trainerNote?.trim() ? training.trainerNote : "Нет заметки"}
                        </div>
                    </div>
                </div>
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            {!isEditing ? (
                <section className="training-details-grid">
                    <div className="training-details-panel">
                        <div className="training-details-panel-header">
                            <div>
                                <div className="training-details-panel-kicker">Сводка</div>
                                <h2 className="training-details-panel-title">Параметры тренировки</h2>
                            </div>
                        </div>

                        <div className="training-meta-grid">
                            <div className="training-meta-item">
                                <span>Дата</span>
                                <strong>{training.trainingDate}</strong>
                            </div>
                            <div className="training-meta-item">
                                <span>Начало</span>
                                <strong>{training.startTime ?? "—"}</strong>
                            </div>
                            <div className="training-meta-item">
                                <span>Окончание</span>
                                <strong>{training.endTime ?? "—"}</strong>
                            </div>
                            <div className="training-meta-item">
                                <span>Клиент</span>
                                <strong>{formatClientName(training)}</strong>
                            </div>
                            <div className="training-meta-item training-meta-item-wide">
                                <span>Заметка тренера</span>
                                <strong>{training.trainerNote ?? "—"}</strong>
                            </div>
                            <div className="training-meta-item training-meta-item-wide">
                                <span>Заметка клиента</span>
                                <strong>{training.clientNote ?? "—"}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="training-details-panel">
                        <div className="training-details-panel-header">
                            <div>
                                <div className="training-details-panel-kicker">Система</div>
                                <h2 className="training-details-panel-title">Метаданные</h2>
                            </div>
                        </div>

                        <div className="dashboard-info-list">
                            <div className="dashboard-info-row">
                                <span>Статус</span>
                                <strong>{getTrainingStatusLabel(training.status)}</strong>
                            </div>
                            <div className="dashboard-info-row">
                                <span>Создано</span>
                                <strong>{new Date(training.createdAt).toLocaleString()}</strong>
                            </div>
                            <div className="dashboard-info-row">
                                <span>Обновлено</span>
                                <strong>{new Date(training.updatedAt).toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="training-details-panel">
                    <div className="training-details-panel-header">
                        <div>
                            <div className="training-details-panel-kicker">Редактирование</div>
                            <h2 className="training-details-panel-title">Изменить тренировку</h2>
                        </div>
                    </div>

                    <form className="trainings-form" onSubmit={handleSave}>
                        <div className="trainings-form-grid">
                            <div className="form-row">
                                <label htmlFor="training-date">Дата</label>
                                <input
                                    id="training-date"
                                    type="date"
                                    value={trainingDate}
                                    onChange={(event) => setTrainingDate(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="start-time">Начало</label>
                                <input
                                    id="start-time"
                                    type="time"
                                    value={startTime}
                                    onChange={(event) => setStartTime(event.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="end-time">Окончание</label>
                                <input
                                    id="end-time"
                                    type="time"
                                    value={endTime}
                                    onChange={(event) => setEndTime(event.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="training-status">Статус</label>
                                <select
                                    id="training-status"
                                    value={status}
                                    onChange={(event) => setStatus(event.target.value)}
                                >
                                    <option value="PLANNED">PLANNED</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <label htmlFor="trainer-note">Заметка тренера</label>
                            <textarea
                                id="trainer-note"
                                value={trainerNote}
                                onChange={(event) => setTrainerNote(event.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="details-actions">
                            <button
                                type="submit"
                                className="dashboard-btn dashboard-btn-primary"
                                disabled={isSaving}
                            >
                                {isSaving ? "Сохраняем..." : "Сохранить"}
                            </button>
                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary"
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section className="training-details-panel">
                <div className="training-details-panel-header">
                    <div>
                        <div className="training-details-panel-kicker">Flow</div>
                        <h2 className="training-details-panel-title">Упражнения</h2>
                    </div>
                </div>

                <div className="training-flow-layout">
                    <div className="training-flow-main">
                        <WorkoutFlowPanel
                            currentIndex={activeExerciseIndex}
                            total={exercises.length}
                            onPrev={() => setActiveExerciseIndex((prev) => Math.max(0, prev - 1))}
                            onNext={() =>
                                setActiveExerciseIndex((prev) =>
                                    Math.min(exercises.length - 1, prev + 1)
                                )
                            }
                        />
                    </div>

                    <div className="training-flow-side">
                        <div className="training-flow-side-card">
                            <span>Текущий индекс</span>
                            <strong>{exercises.length > 0 ? activeExerciseIndex + 1 : 0}</strong>
                        </div>
                        <div className="training-flow-side-card">
                            <span>Всего упражнений</span>
                            <strong>{exercises.length}</strong>
                        </div>
                        <div className="training-flow-side-card">
                            <span>Выполнено</span>
                            <strong>{completedCount}</strong>
                        </div>
                    </div>
                </div>

                {isTrainer && (
                    <form className="trainings-form top-gap" onSubmit={handleCreateExercise}>
                        <div className="training-details-panel-header">
                            <div>
                                <div className="training-details-panel-kicker">Добавление</div>
                                <h3 className="training-details-subpanel-title">Новое упражнение</h3>
                            </div>
                        </div>

                        <div className="form-row">
                            <label htmlFor="exercise-title">Название</label>
                            <input
                                id="exercise-title"
                                type="text"
                                value={createExerciseForm.title}
                                onChange={(event) =>
                                    setCreateExerciseForm((prev) => ({ ...prev, title: event.target.value }))
                                }
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label htmlFor="exercise-description">Описание</label>
                            <textarea
                                id="exercise-description"
                                value={createExerciseForm.description}
                                onChange={(event) =>
                                    setCreateExerciseForm((prev) => ({
                                        ...prev,
                                        description: event.target.value,
                                    }))
                                }
                                rows={3}
                            />
                        </div>

                        <div className="trainings-form-grid">
                            <div className="form-row">
                                <label htmlFor="exercise-sets">Подходы</label>
                                <input
                                    id="exercise-sets"
                                    type="number"
                                    min="1"
                                    value={createExerciseForm.sets}
                                    onChange={(event) =>
                                        setCreateExerciseForm((prev) => ({ ...prev, sets: event.target.value }))
                                    }
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="exercise-reps">Повторы</label>
                                <input
                                    id="exercise-reps"
                                    type="number"
                                    min="1"
                                    value={createExerciseForm.reps}
                                    onChange={(event) =>
                                        setCreateExerciseForm((prev) => ({ ...prev, reps: event.target.value }))
                                    }
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="exercise-duration">Длительность, сек</label>
                                <input
                                    id="exercise-duration"
                                    type="number"
                                    min="1"
                                    value={createExerciseForm.durationSeconds}
                                    onChange={(event) =>
                                        setCreateExerciseForm((prev) => ({
                                            ...prev,
                                            durationSeconds: event.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="exercise-rest">Отдых, сек</label>
                                <input
                                    id="exercise-rest"
                                    type="number"
                                    min="0"
                                    value={createExerciseForm.restSeconds}
                                    onChange={(event) =>
                                        setCreateExerciseForm((prev) => ({
                                            ...prev,
                                            restSeconds: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label htmlFor="exercise-trainer-note">Заметка тренера</label>
                            <textarea
                                id="exercise-trainer-note"
                                value={createExerciseForm.trainerNote}
                                onChange={(event) =>
                                    setCreateExerciseForm((prev) => ({
                                        ...prev,
                                        trainerNote: event.target.value,
                                    }))
                                }
                                rows={3}
                            />
                        </div>

                        <div className="details-actions">
                            <button
                                type="submit"
                                className="dashboard-btn dashboard-btn-primary"
                                disabled={isCreatingExercise}
                            >
                                {isCreatingExercise ? "Создаём..." : "Добавить упражнение"}
                            </button>
                        </div>
                    </form>
                )}

                {exerciseErrorMessage && <div className="error-box top-gap">{exerciseErrorMessage}</div>}

                {isLoadingExercises && <p className="top-gap">Загрузка упражнений...</p>}

                {!isLoadingExercises && !exerciseErrorMessage && exercises.length === 0 && (
                    <div className="training-empty-block top-gap">
                        <div className="trainings-empty-title">В этой тренировке пока нет упражнений</div>
                        <div className="trainings-empty-text">
                            Добавь первое упражнение, чтобы начать собирать занятие.
                        </div>
                    </div>
                )}

                {!isLoadingExercises && !exerciseErrorMessage && exercises.length > 0 && (
                    <div className="exercise-list top-gap">
                        {exercises.map((exercise, index) => {
                            const isActiveExercise = index === activeExerciseIndex;
                            const isEditingExercise = editingExerciseId === exercise.id;
                            const isSavingExercise = savingExerciseId === exercise.id;
                            const isDeletingExercise = deletingExerciseId === exercise.id;
                            const isToggling = togglingExerciseId === exercise.id;
                            const isSavingTrainerNote = savingTrainerNoteId === exercise.id;
                            const isSavingClientNote = savingClientNoteId === exercise.id;

                            return (
                                <div
                                    key={exercise.id}
                                    className={isActiveExercise ? "exercise-card active" : "exercise-card"}
                                >
                                    {!isEditingExercise ? (
                                        <>
                                            <div className="exercise-card-header">
                                                <div className="exercise-card-header-main">
                                                    <div className="exercise-order-badge">{exercise.orderNum}</div>
                                                    <div>
                                                        <h3 className="exercise-card-title">{exercise.title}</h3>
                                                        <div className="exercise-card-subtitle">
                                                            {formatExerciseLoad(exercise)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="exercise-card-header-right">
                                                    <label className="exercise-toggle">
                                                        <input
                                                            type="checkbox"
                                                            checked={exercise.isCompleted}
                                                            disabled={isToggling}
                                                            onChange={(event) =>
                                                                handleToggleCompletion(exercise, event.target.checked)
                                                            }
                                                        />
                                                        <span
                                                            className={
                                                                exercise.isCompleted
                                                                    ? "exercise-status completed"
                                                                    : "exercise-status"
                                                            }
                                                        >
                              {exercise.isCompleted ? "Выполнено" : "Не выполнено"}
                            </span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="exercise-card-body">
                                                <div className="exercise-info-grid">
                                                    <div className="exercise-info-card">
                                                        <span>Описание</span>
                                                        <strong>{exercise.description ?? "Описание не указано"}</strong>
                                                    </div>

                                                    <div className="exercise-info-card">
                                                        <span>Параметры</span>
                                                        <strong>{formatExerciseLoad(exercise)}</strong>
                                                    </div>
                                                </div>

                                                <div className="exercise-timers-row">
                                                    <div className="exercise-timer-card">
                                                        <ExerciseTimerPanel durationSeconds={exercise.durationSeconds} />
                                                    </div>
                                                    <div className="exercise-timer-card">
                                                        <RestTimerPanel restSeconds={exercise.restSeconds} />
                                                    </div>
                                                </div>

                                                {isTrainer ? (
                                                    <div className="form-row">
                                                        <label>Заметка тренера</label>
                                                        <textarea
                                                            value={trainerNotesDraft[exercise.id] ?? ""}
                                                            onChange={(event) =>
                                                                setTrainerNotesDraft((prev) => ({
                                                                    ...prev,
                                                                    [exercise.id]: event.target.value,
                                                                }))
                                                            }
                                                            rows={3}
                                                        />
                                                        <div className="details-actions">
                                                            <button
                                                                type="button"
                                                                className="dashboard-btn dashboard-btn-secondary"
                                                                onClick={() => handleSaveTrainerNote(exercise.id)}
                                                                disabled={isSavingTrainerNote}
                                                            >
                                                                {isSavingTrainerNote
                                                                    ? "Сохраняем..."
                                                                    : "Сохранить заметку тренера"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="exercise-note-box">
                                                        <span>Заметка тренера</span>
                                                        <strong>{exercise.trainerNote ?? "Нет заметки"}</strong>
                                                    </div>
                                                )}

                                                <div className="form-row">
                                                    <label>Заметка клиента</label>
                                                    <textarea
                                                        value={clientNotesDraft[exercise.id] ?? ""}
                                                        onChange={(event) =>
                                                            setClientNotesDraft((prev) => ({
                                                                ...prev,
                                                                [exercise.id]: event.target.value,
                                                            }))
                                                        }
                                                        rows={3}
                                                    />
                                                    <div className="details-actions">
                                                        <button
                                                            type="button"
                                                            className="dashboard-btn dashboard-btn-secondary"
                                                            onClick={() => handleSaveClientNote(exercise.id)}
                                                            disabled={isSavingClientNote}
                                                        >
                                                            {isSavingClientNote
                                                                ? "Сохраняем..."
                                                                : "Сохранить заметку клиента"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="exercise-card-actions">
                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-secondary"
                                                    onClick={() => setActiveExerciseIndex(index)}
                                                >
                                                    Сделать текущим
                                                </button>

                                                {isTrainer && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="dashboard-btn dashboard-btn-primary"
                                                            onClick={() => startEditExercise(exercise)}
                                                        >
                                                            Редактировать
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="dashboard-btn dashboard-btn-secondary"
                                                            onClick={() => handleDeleteExercise(exercise.id)}
                                                            disabled={isDeletingExercise}
                                                        >
                                                            {isDeletingExercise ? "Удаляем..." : "Удалить"}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="trainings-form">
                                            <div className="training-details-panel-header">
                                                <div>
                                                    <div className="training-details-panel-kicker">Редактирование</div>
                                                    <h3 className="training-details-subpanel-title">
                                                        Изменить упражнение
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <label>Название</label>
                                                <input
                                                    type="text"
                                                    value={editExerciseForm.title}
                                                    onChange={(event) =>
                                                        setEditExerciseForm((prev) => ({
                                                            ...prev,
                                                            title: event.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className="form-row">
                                                <label>Описание</label>
                                                <textarea
                                                    value={editExerciseForm.description}
                                                    onChange={(event) =>
                                                        setEditExerciseForm((prev) => ({
                                                            ...prev,
                                                            description: event.target.value,
                                                        }))
                                                    }
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="trainings-form-grid">
                                                <div className="form-row">
                                                    <label>Подходы</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editExerciseForm.sets}
                                                        onChange={(event) =>
                                                            setEditExerciseForm((prev) => ({
                                                                ...prev,
                                                                sets: event.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>

                                                <div className="form-row">
                                                    <label>Повторы</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editExerciseForm.reps}
                                                        onChange={(event) =>
                                                            setEditExerciseForm((prev) => ({
                                                                ...prev,
                                                                reps: event.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>

                                                <div className="form-row">
                                                    <label>Длительность, сек</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={editExerciseForm.durationSeconds}
                                                        onChange={(event) =>
                                                            setEditExerciseForm((prev) => ({
                                                                ...prev,
                                                                durationSeconds: event.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>

                                                <div className="form-row">
                                                    <label>Отдых, сек</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editExerciseForm.restSeconds}
                                                        onChange={(event) =>
                                                            setEditExerciseForm((prev) => ({
                                                                ...prev,
                                                                restSeconds: event.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-row">
                                                <label>Заметка тренера</label>
                                                <textarea
                                                    value={editExerciseForm.trainerNote}
                                                    onChange={(event) =>
                                                        setEditExerciseForm((prev) => ({
                                                            ...prev,
                                                            trainerNote: event.target.value,
                                                        }))
                                                    }
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="details-actions">
                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-primary"
                                                    onClick={() => handleSaveExercise(exercise.id)}
                                                    disabled={isSavingExercise}
                                                >
                                                    {isSavingExercise ? "Сохраняем..." : "Сохранить"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="dashboard-btn dashboard-btn-secondary"
                                                    onClick={cancelEditExercise}
                                                    disabled={isSavingExercise}
                                                >
                                                    Отмена
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}