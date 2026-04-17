import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import { trainingApi } from "../shared/api/trainingApi";
import { trainingExerciseApi } from "../shared/api/trainingExerciseApi";
import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";
import { useAuth } from "../features/auth/model/AuthContext";

import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    TrainingResponse,
    UpdateTrainingRequest,
} from "../features/training/model/training.types";
import type {
    CreateTrainingExerciseRequest as ApiCreateTrainingExerciseRequest,
    UpdateTrainingExerciseRequest as ApiUpdateTrainingExerciseRequest,
} from "../features/training-exercise/model/trainingExercise.types";

type RepsMode = "NONE" | "EXACT" | "RANGE";

type TrainingExerciseView = {
    id: number;
    trainingId: number;
    orderNum: number;
    title: string;
    description: string | null;
    sets: number | null;
    repsMode: RepsMode;
    repsValue: number | null;
    repsFrom: number | null;
    repsTo: number | null;
    repsDisplay: string;
    durationSeconds: number | null;
    restSeconds: number | null;
    isCompleted: boolean;
    trainerNote: string | null;
    clientNote: string | null;
    createdAt: string;
    updatedAt: string;
};

type ExerciseTemplateView = {
    id: number;
    trainerId: number;
    name: string;
    description?: string | null;
    sets?: number | null;
    repsMode: RepsMode;
    repsValue?: number | null;
    repsFrom?: number | null;
    repsTo?: number | null;
    repsDisplay: string;
    durationSeconds?: number | null;
    restSeconds?: number | null;
    trainerNote?: string | null;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
};

type ExerciseFormState = {
    title: string;
    description: string;
    sets: string;
    repsMode: "" | RepsMode;
    repsValue: string;
    repsFrom: string;
    repsTo: string;
    durationSeconds: string;
    restSeconds: string;
    trainerNote: string;
};

type CreateExerciseMode = "manual" | "template";

const emptyExerciseForm: ExerciseFormState = {
    title: "",
    description: "",
    sets: "",
    repsMode: "",
    repsValue: "",
    repsFrom: "",
    repsTo: "",
    durationSeconds: "",
    restSeconds: "",
    trainerNote: "",
};

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function formatClientName(training: TrainingResponse): string {
    const fullName = [training.clientFirstName, training.clientLastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || training.clientEmail || `Клиент #${training.clientId}`;
}

function normalizeTime(value?: string | null): string {
    if (!value) {
        return "";
    }

    return value.slice(0, 5);
}

function formatTimeRange(startTime?: string | null, endTime?: string | null): string {
    const normalizedStart = normalizeTime(startTime);
    const normalizedEnd = normalizeTime(endTime);

    if (!normalizedStart && !normalizedEnd) {
        return "Время не указано";
    }

    if (normalizedStart && normalizedEnd) {
        return `${normalizedStart}–${normalizedEnd}`;
    }

    return normalizedStart || normalizedEnd || "Время не указано";
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
            return "training-status training-status--planned";
        case "COMPLETED":
            return "training-status training-status--completed";
        case "CANCELLED":
            return "training-status training-status--cancelled";
        default:
            return "training-status";
    }
}

function getExerciseStatusLabel(exercise: TrainingExerciseView, isExpanded: boolean): string {
    if (exercise.isCompleted) {
        return "Готово";
    }

    if (isExpanded) {
        return "Открыто";
    }

    return "План";
}

function getExerciseStatusClass(exercise: TrainingExerciseView, isExpanded: boolean): string {
    if (exercise.isCompleted) {
        return "exercise-compact-status exercise-compact-status--completed";
    }

    if (isExpanded) {
        return "exercise-compact-status exercise-compact-status--active";
    }

    return "exercise-compact-status exercise-compact-status--planned";
}

function formatExerciseSummary(exercise: TrainingExerciseView): string {
    const parts: string[] = [];

    if (exercise.sets != null) {
        parts.push(`${exercise.sets} подх.`);
    }

    if (exercise.repsMode !== "NONE" && exercise.repsDisplay) {
        parts.push(`${exercise.repsDisplay} повт.`);
    }

    if (exercise.durationSeconds != null) {
        parts.push(`${exercise.durationSeconds} сек.`);
    }

    if (exercise.restSeconds != null) {
        parts.push(`отдых ${exercise.restSeconds} сек.`);
    }

    return parts.length > 0 ? parts.join(" • ") : "Параметры не заданы";
}

function normalizeExerciseFormByMode(
    form: ExerciseFormState,
    mode: "" | RepsMode
): ExerciseFormState {
    if (mode === "EXACT") {
        return {
            ...form,
            repsMode: "EXACT",
            repsFrom: "",
            repsTo: "",
        };
    }

    if (mode === "RANGE") {
        return {
            ...form,
            repsMode: "RANGE",
            repsValue: "",
        };
    }

    if (mode === "NONE") {
        return {
            ...form,
            repsMode: "NONE",
            repsValue: "",
            repsFrom: "",
            repsTo: "",
        };
    }

    return {
        ...form,
        repsMode: "",
        repsValue: "",
        repsFrom: "",
        repsTo: "",
    };
}

function getRepsDisplay(item: {
    repsMode?: RepsMode | null;
    repsDisplay?: string | null;
    repsValue?: number | null;
    repsFrom?: number | null;
    repsTo?: number | null;
}): string {
    if (item.repsMode === "EXACT") {
        return item.repsDisplay || (item.repsValue != null ? String(item.repsValue) : "—");
    }

    if (item.repsMode === "RANGE") {
        return item.repsDisplay ||
            (item.repsFrom != null && item.repsTo != null ? `${item.repsFrom}–${item.repsTo}` : "—");
    }

    return "—";
}

function validateExerciseForm(form: ExerciseFormState): string | null {
    if (!form.title.trim()) {
        return "Укажи название упражнения";
    }

    if (form.repsMode === "EXACT" && !form.repsValue.trim()) {
        return "Укажи точное количество повторений";
    }

    if (form.repsMode === "RANGE") {
        if (!form.repsFrom.trim() || !form.repsTo.trim()) {
            return "Укажи нижнюю и верхнюю границы повторений";
        }

        if (Number(form.repsFrom) > Number(form.repsTo)) {
            return "Нижняя граница повторений не может быть больше верхней";
        }
    }

    return null;
}

function buildExercisePayload(form: ExerciseFormState): ApiCreateTrainingExerciseRequest {
    const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        sets: form.sets.trim() ? Number(form.sets) : undefined,
        durationSeconds: form.durationSeconds.trim() ? Number(form.durationSeconds) : undefined,
        restSeconds: form.restSeconds.trim() ? Number(form.restSeconds) : undefined,
        trainerNote: form.trainerNote.trim() || undefined,
        repsMode: form.repsMode || "NONE",
        repsValue:
            form.repsMode === "EXACT" && form.repsValue.trim()
                ? Number(form.repsValue)
                : undefined,
        repsFrom:
            form.repsMode === "RANGE" && form.repsFrom.trim()
                ? Number(form.repsFrom)
                : undefined,
        repsTo:
            form.repsMode === "RANGE" && form.repsTo.trim()
                ? Number(form.repsTo)
                : undefined,
    };

    return payload as unknown as ApiCreateTrainingExerciseRequest;
}

function toExerciseFormState(exercise: TrainingExerciseView): ExerciseFormState {
    return {
        title: exercise.title ?? "",
        description: exercise.description ?? "",
        sets: exercise.sets != null ? String(exercise.sets) : "",
        repsMode: exercise.repsMode ?? "",
        repsValue:
            exercise.repsMode === "EXACT" && exercise.repsValue != null
                ? String(exercise.repsValue)
                : "",
        repsFrom:
            exercise.repsMode === "RANGE" && exercise.repsFrom != null
                ? String(exercise.repsFrom)
                : "",
        repsTo:
            exercise.repsMode === "RANGE" && exercise.repsTo != null
                ? String(exercise.repsTo)
                : "",
        durationSeconds:
            exercise.durationSeconds != null ? String(exercise.durationSeconds) : "",
        restSeconds: exercise.restSeconds != null ? String(exercise.restSeconds) : "",
        trainerNote: exercise.trainerNote ?? "",
    };
}

export default function TrainingDetailsPage() {
    const { trainingId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [training, setTraining] = useState<TrainingResponse | null>(null);
    const [exercises, setExercises] = useState<TrainingExerciseView[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingExercises, setIsLoadingExercises] = useState(true);

    const [errorMessage, setErrorMessage] = useState("");
    const [exerciseErrorMessage, setExerciseErrorMessage] = useState("");

    const [isEditingTraining, setIsEditingTraining] = useState(false);
    const [isSavingTraining, setIsSavingTraining] = useState(false);
    const [isCancellingTraining, setIsCancellingTraining] = useState(false);
    const [isCompletingTraining, setIsCompletingTraining] = useState(false);

    const [trainingDate, setTrainingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [status, setStatus] = useState("");
    const [trainerNote, setTrainerNote] = useState("");

    const [isCreateExerciseOpen, setIsCreateExerciseOpen] = useState(false);
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [createExerciseForm, setCreateExerciseForm] =
        useState<ExerciseFormState>(emptyExerciseForm);

    const [createExerciseMode, setCreateExerciseMode] =
        useState<CreateExerciseMode>("manual");
    const [exerciseTemplates, setExerciseTemplates] = useState<ExerciseTemplateView[]>([]);
    const [isLoadingExerciseTemplates, setIsLoadingExerciseTemplates] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");

    const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(null);
    const [editingExerciseId, setEditingExerciseId] = useState<number | null>(null);
    const [editExerciseForm, setEditExerciseForm] =
        useState<ExerciseFormState>(emptyExerciseForm);

    const [savingExerciseId, setSavingExerciseId] = useState<number | null>(null);
    const [deletingExerciseId, setDeletingExerciseId] = useState<number | null>(null);
    const [togglingExerciseId, setTogglingExerciseId] = useState<number | null>(null);
    const [movingExerciseId, setMovingExerciseId] = useState<number | null>(null);
    const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);

    const isTrainer = currentUser?.role === "TRAINER";
    const isClient = currentUser?.role === "CLIENT";

    const sortedExercises = useMemo(
        () => [...exercises].sort((a, b) => a.orderNum - b.orderNum),
        [exercises]
    );

    const selectedTemplate = useMemo(
        () =>
            exerciseTemplates.find((item) => String(item.id) === selectedTemplateId) ?? null,
        [exerciseTemplates, selectedTemplateId]
    );

    const completedCount = useMemo(
        () => sortedExercises.filter((item) => item.isCompleted).length,
        [sortedExercises]
    );

    const progressPercent =
        sortedExercises.length > 0
            ? Math.round((completedCount / sortedExercises.length) * 100)
            : 0;

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
                const data = await trainingApi.getTraining(Number(trainingId));
                setTraining(data);
                setTrainingDate(data.trainingDate);
                setStartTime(normalizeTime(data.startTime));
                setEndTime(normalizeTime(data.endTime));
                setStatus(data.status);
                setTrainerNote(data.trainerNote ?? "");
            } catch (error) {
                setErrorMessage(resolveApiError(error, "Не удалось загрузить тренировку"));
            } finally {
                setIsLoading(false);
            }
        }

        void loadTraining();
    }, [trainingId]);

    useEffect(() => {
        async function loadExercises() {
            if (!trainingId) {
                setExerciseErrorMessage("Не указан id тренировки");
                setIsLoadingExercises(false);
                return;
            }

            setExerciseErrorMessage("");
            setIsLoadingExercises(true);

            try {
                const data = (await trainingExerciseApi.getExercises(Number(trainingId))) as unknown as TrainingExerciseView[];
                setExercises(data);

                if (data.length > 0) {
                    setExpandedExerciseId((current) => current ?? data[0].id);
                }
            } catch (error) {
                setExerciseErrorMessage(resolveApiError(error, "Не удалось загрузить упражнения"));
            } finally {
                setIsLoadingExercises(false);
            }
        }

        void loadExercises();
    }, [trainingId]);

    useEffect(() => {
        async function loadTemplates() {
            if (!isCreateExerciseOpen || !isTrainer) {
                return;
            }

            setIsLoadingExerciseTemplates(true);

            try {
                const data = (await exerciseTemplateApi.getTemplates(false)) as unknown as ExerciseTemplateView[];
                setExerciseTemplates(data);

                if (data.length > 0) {
                    setSelectedTemplateId((current) => current || String(data[0].id));
                }
            } catch (error) {
                setExerciseErrorMessage(
                    resolveApiError(error, "Не удалось загрузить шаблоны упражнений")
                );
            } finally {
                setIsLoadingExerciseTemplates(false);
            }
        }

        void loadTemplates();
    }, [isCreateExerciseOpen, isTrainer]);

    const resetCreateExerciseState = () => {
        setIsCreateExerciseOpen(false);
        setCreateExerciseMode("manual");
        setCreateExerciseForm(emptyExerciseForm);
        setSelectedTemplateId("");
    };

    const handleSaveTraining = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!training) {
            return;
        }

        setErrorMessage("");
        setIsSavingTraining(true);

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
            setIsEditingTraining(false);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось обновить тренировку"));
        } finally {
            setIsSavingTraining(false);
        }
    };

    const handleCompleteTraining = async () => {
        if (!training) {
            return;
        }

        setErrorMessage("");
        setIsCompletingTraining(true);

        try {
            const updated = await trainingApi.completeTraining(training.id);
            setTraining(updated);
            setStatus(updated.status);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось завершить тренировку"));
        } finally {
            setIsCompletingTraining(false);
        }
    };

    const handleCancelTraining = async () => {
        if (!training) {
            return;
        }

        const confirmed = window.confirm("Отменить тренировку?");
        if (!confirmed) {
            return;
        }

        setErrorMessage("");
        setIsCancellingTraining(true);

        try {
            await trainingApi.cancelTraining(training.id);
            const reloaded = await trainingApi.getTraining(training.id);
            setTraining(reloaded);
            setStatus(reloaded.status);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось отменить тренировку"));
        } finally {
            setIsCancellingTraining(false);
        }
    };

    const handleCreateExercise = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!trainingId) {
            return;
        }

        const createValidationError = validateExerciseForm(createExerciseForm);
        if (createValidationError) {
            setExerciseErrorMessage(createValidationError);
            return;
        }

        setExerciseErrorMessage("");
        setIsCreatingExercise(true);

        try {
            const created = (await trainingExerciseApi.createExercise(
                Number(trainingId),
                buildExercisePayload(createExerciseForm)
            )) as unknown as TrainingExerciseView;

            setExercises((prev) => [...prev, created]);
            setCreateExerciseForm(emptyExerciseForm);
            setExpandedExerciseId(created.id);
            resetCreateExerciseState();
        } catch (error) {
            setExerciseErrorMessage(resolveApiError(error, "Не удалось создать упражнение"));
        } finally {
            setIsCreatingExercise(false);
        }
    };

    const handleCreateExerciseFromTemplate = async () => {
        if (!trainingId) {
            return;
        }

        if (!selectedTemplateId) {
            setExerciseErrorMessage("Выбери шаблон упражнения");
            return;
        }

        setExerciseErrorMessage("");
        setIsCreatingExercise(true);

        try {
            const created = (await exerciseTemplateApi.addTemplateToTraining(Number(trainingId), {
                templateId: Number(selectedTemplateId),
            })) as unknown as TrainingExerciseView;

            setExercises((prev) => [...prev, created]);
            setExpandedExerciseId(created.id);
            resetCreateExerciseState();
        } catch (error) {
            setExerciseErrorMessage(
                resolveApiError(error, "Не удалось добавить упражнение из шаблона")
            );
        } finally {
            setIsCreatingExercise(false);
        }
    };

    const startEditExercise = (exercise: TrainingExerciseView) => {
        setEditingExerciseId(exercise.id);
        setExpandedExerciseId(exercise.id);
        setEditExerciseForm(toExerciseFormState(exercise));
    };

    const cancelEditExercise = () => {
        setEditingExerciseId(null);
        setEditExerciseForm(emptyExerciseForm);
    };

    const handleSaveExercise = async (exerciseId: number) => {
        if (!trainingId) {
            return;
        }

        const editValidationError = validateExerciseForm(editExerciseForm);
        if (editValidationError) {
            setExerciseErrorMessage(editValidationError);
            return;
        }

        setExerciseErrorMessage("");
        setSavingExerciseId(exerciseId);

        const payload = {
            title: editExerciseForm.title.trim(),
            description: editExerciseForm.description.trim() || undefined,
            sets: editExerciseForm.sets.trim() ? Number(editExerciseForm.sets) : undefined,
            durationSeconds: editExerciseForm.durationSeconds.trim()
                ? Number(editExerciseForm.durationSeconds)
                : undefined,
            restSeconds: editExerciseForm.restSeconds.trim()
                ? Number(editExerciseForm.restSeconds)
                : undefined,
            trainerNote: editExerciseForm.trainerNote.trim() || undefined,
            repsMode: editExerciseForm.repsMode || "NONE",
            repsValue:
                editExerciseForm.repsMode === "EXACT" && editExerciseForm.repsValue.trim()
                    ? Number(editExerciseForm.repsValue)
                    : undefined,
            repsFrom:
                editExerciseForm.repsMode === "RANGE" && editExerciseForm.repsFrom.trim()
                    ? Number(editExerciseForm.repsFrom)
                    : undefined,
            repsTo:
                editExerciseForm.repsMode === "RANGE" && editExerciseForm.repsTo.trim()
                    ? Number(editExerciseForm.repsTo)
                    : undefined,
        } as unknown as ApiUpdateTrainingExerciseRequest;

        try {
            const updated = (await trainingExerciseApi.updateExercise(
                Number(trainingId),
                exerciseId,
                payload
            )) as unknown as TrainingExerciseView;

            setExercises((prev) =>
                prev.map((exercise) => (exercise.id === exerciseId ? updated : exercise))
            );
            cancelEditExercise();
        } catch (error) {
            setExerciseErrorMessage(resolveApiError(error, "Не удалось обновить упражнение"));
        } finally {
            setSavingExerciseId(null);
        }
    };

    const handleDeleteExercise = async (exerciseId: number) => {
        if (!trainingId) {
            return;
        }

        const confirmed = window.confirm("Удалить упражнение?");
        if (!confirmed) {
            return;
        }

        setExerciseErrorMessage("");
        setDeletingExerciseId(exerciseId);

        try {
            await trainingExerciseApi.deleteExercise(Number(trainingId), exerciseId);
            setExercises((prev) => prev.filter((exercise) => exercise.id !== exerciseId));

            if (expandedExerciseId === exerciseId) {
                setExpandedExerciseId(null);
            }

            if (editingExerciseId === exerciseId) {
                cancelEditExercise();
            }
        } catch (error) {
            setExerciseErrorMessage(resolveApiError(error, "Не удалось удалить упражнение"));
        } finally {
            setDeletingExerciseId(null);
        }
    };

    const handleToggleCompletion = async (
        exercise: TrainingExerciseView,
        nextValue: boolean
    ) => {
        if (!trainingId) {
            return;
        }

        setExerciseErrorMessage("");
        setTogglingExerciseId(exercise.id);

        try {
            const updated = (await trainingExerciseApi.updateCompletion(
                Number(trainingId),
                exercise.id,
                { isCompleted: nextValue }
            )) as unknown as TrainingExerciseView;

            setExercises((prev) =>
                prev.map((item) => (item.id === exercise.id ? updated : item))
            );
        } catch (error) {
            setExerciseErrorMessage(resolveApiError(error, "Не удалось обновить выполнение"));
        } finally {
            setTogglingExerciseId(null);
        }
    };

    const handleMoveExercise = async (exerciseId: number, direction: -1 | 1) => {
        if (!trainingId) {
            return;
        }

        const currentIndex = sortedExercises.findIndex((item) => item.id === exerciseId);
        const targetIndex = currentIndex + direction;

        if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sortedExercises.length) {
            return;
        }

        const currentExercise = sortedExercises[currentIndex];
        const targetExercise = sortedExercises[targetIndex];
        const previous = exercises;

        setExerciseErrorMessage("");
        setMovingExerciseId(exerciseId);

        setExercises((prev) =>
            prev.map((item) => {
                if (item.id === currentExercise.id) {
                    return { ...item, orderNum: targetExercise.orderNum };
                }

                if (item.id === targetExercise.id) {
                    return { ...item, orderNum: currentExercise.orderNum };
                }

                return item;
            })
        );

        try {
            const [updatedCurrent, updatedTarget] = (await Promise.all([
                trainingExerciseApi.updateExercise(Number(trainingId), currentExercise.id, {
                    orderNum: targetExercise.orderNum,
                } as unknown as ApiUpdateTrainingExerciseRequest),
                trainingExerciseApi.updateExercise(Number(trainingId), targetExercise.id, {
                    orderNum: currentExercise.orderNum,
                } as unknown as ApiUpdateTrainingExerciseRequest),
            ])) as unknown as [TrainingExerciseView, TrainingExerciseView];

            setExercises((prev) =>
                prev.map((item) => {
                    if (item.id === updatedCurrent.id) {
                        return updatedCurrent;
                    }

                    if (item.id === updatedTarget.id) {
                        return updatedTarget;
                    }

                    return item;
                })
            );
        } catch (error) {
            setExercises(previous);
            setExerciseErrorMessage(resolveApiError(error, "Не удалось изменить порядок упражнений"));
        } finally {
            setMovingExerciseId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="training-details-page training-details-page-compact entity-page-compact">
                <section className="training-details-panel training-details-panel-compact entity-panel-compact">
                    <div className="training-empty-block">Загрузка...</div>
                </section>
            </div>
        );
    }

    if (errorMessage && !training) {
        return (
            <div className="training-details-page training-details-page-compact entity-page-compact">
                <div className="error-box">{errorMessage}</div>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary"
                    onClick={() => navigate("/trainings")}
                >
                    Назад к тренировкам
                </button>
            </div>
        );
    }

    if (!training) {
        return (
            <div className="training-details-page training-details-page-compact entity-page-compact">
                <section className="training-details-panel training-details-panel-compact entity-panel-compact">
                    <div className="training-empty-block">Тренировка не найдена.</div>
                </section>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary"
                    onClick={() => navigate("/trainings")}
                >
                    Назад к тренировкам
                </button>
            </div>
        );
    }

    return (
        <div className="training-details-page training-details-page-compact entity-page-compact">
            <section className="training-details-header-bar entity-header-bar">
                <div className="training-details-header-main entity-header-main">
                    <h1 className="training-details-header-title entity-header-title">
                        Тренировка #{training.id}
                    </h1>

                    <div className="training-details-subline">
                        <span>{training.trainingDate}</span>
                        <span>{formatTimeRange(training.startTime, training.endTime)}</span>
                        <span>{isTrainer ? formatClientName(training) : "Детали тренировки"}</span>
                    </div>

                    <div className="training-details-summary-row entity-summary-row">
            <span className={getTrainingStatusClass(training.status)}>
              {getTrainingStatusLabel(training.status)}
            </span>

                        <span className="entity-summary-chip">
              <strong>{sortedExercises.length}</strong>
              <span>Упражнений</span>
            </span>

                        <span className="entity-summary-chip entity-summary-chip--positive">
              <strong>{completedCount}</strong>
              <span>Выполнено</span>
            </span>

                        <span className="entity-summary-chip entity-summary-chip--info">
              <strong>{progressPercent}%</strong>
              <span>Прогресс</span>
            </span>
                    </div>
                </div>

                <div className="training-details-header-actions">
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary entity-header-action training-details-action-desktop-only"
                        onClick={() => navigate("/trainings")}
                    >
                        Назад
                    </button>

                    {isTrainer && training.status === "PLANNED" && (
                        <>
                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary entity-header-action training-details-action-desktop-only"
                                onClick={() => setIsEditingTraining((prev) => !prev)}
                            >
                                {isEditingTraining ? "Скрыть настройки" : "Настройки"}
                            </button>

                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-primary entity-header-action training-details-add-primary"
                                onClick={() => setIsCreateExerciseOpen((prev) => !prev)}
                            >
                                {isCreateExerciseOpen ? "Скрыть форму" : "Добавить упражнение"}
                            </button>

                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary entity-header-action training-details-action-desktop-only"
                                onClick={() => void handleCompleteTraining()}
                                disabled={isCompletingTraining}
                            >
                                {isCompletingTraining ? "Завершаем..." : "Завершить"}
                            </button>

                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary entity-header-action training-details-action-desktop-only"
                                onClick={() => void handleCancelTraining()}
                                disabled={isCancellingTraining}
                            >
                                {isCancellingTraining ? "Отменяем..." : "Отменить"}
                            </button>

                            <button
                                type="button"
                                className="card-action-btn card-action-btn-neutral training-details-mobile-more"
                                onClick={() => setIsMobileActionsOpen(true)}
                                title="Дополнительные действия"
                            >
                                ⋯
                            </button>
                        </>
                    )}

                    {isClient && training.status !== "CANCELLED" && (
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary entity-header-action"
                            onClick={() => navigate(`/trainings/${training.id}/reschedule-request`)}
                        >
                            Запросить перенос
                        </button>
                    )}
                </div>
            </section>

            {isMobileActionsOpen && (
                <>
                    <div
                        className="training-details-mobile-actions-overlay"
                        onClick={() => setIsMobileActionsOpen(false)}
                    />

                    <section className="training-details-mobile-actions-sheet">
                        <div className="training-details-mobile-actions-handle" />

                        <div className="training-details-mobile-actions-title">
                            Действия с тренировкой
                        </div>

                        <div className="training-details-mobile-actions-list">
                            {isTrainer && training.status === "PLANNED" && (
                                <>
                                    <button
                                        type="button"
                                        className="training-details-mobile-action-btn"
                                        onClick={() => {
                                            setIsEditingTraining((prev) => !prev);
                                            setIsMobileActionsOpen(false);
                                        }}
                                    >
                                        {isEditingTraining ? "Скрыть настройки" : "Настройки"}
                                    </button>

                                    <button
                                        type="button"
                                        className="training-details-mobile-action-btn"
                                        onClick={() => {
                                            void handleCompleteTraining();
                                            setIsMobileActionsOpen(false);
                                        }}
                                        disabled={isCompletingTraining}
                                    >
                                        {isCompletingTraining ? "Завершаем..." : "Завершить тренировку"}
                                    </button>

                                    <button
                                        type="button"
                                        className="training-details-mobile-action-btn training-details-mobile-action-btn-danger"
                                        onClick={() => {
                                            void handleCancelTraining();
                                            setIsMobileActionsOpen(false);
                                        }}
                                        disabled={isCancellingTraining}
                                    >
                                        {isCancellingTraining ? "Отменяем..." : "Отменить тренировку"}
                                    </button>
                                </>
                            )}

                            <button
                                type="button"
                                className="training-details-mobile-action-btn"
                                onClick={() => setIsMobileActionsOpen(false)}
                            >
                                Закрыть
                            </button>
                        </div>
                    </section>
                </>
            )}

            {errorMessage && <div className="error-box">{errorMessage}</div>}
            {exerciseErrorMessage && <div className="error-box">{exerciseErrorMessage}</div>}

            {isEditingTraining && isTrainer && (
                <section className="training-details-panel training-details-panel-compact entity-panel-compact">
                    <div className="training-details-section-head entity-section-head">
                        <h2 className="training-details-section-title entity-section-title">
                            Параметры тренировки
                        </h2>
                    </div>

                    <form className="training-details-inline-form" onSubmit={handleSaveTraining}>
                        <div className="training-details-inline-grid">
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
                                <label htmlFor="training-start-time">Начало</label>
                                <input
                                    id="training-start-time"
                                    type="time"
                                    value={startTime}
                                    onChange={(event) => setStartTime(event.target.value)}
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="training-end-time">Окончание</label>
                                <input
                                    id="training-end-time"
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
                                    <option value="PLANNED">Запланирована</option>
                                    <option value="COMPLETED">Завершена</option>
                                    <option value="CANCELLED">Отменена</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <label htmlFor="training-note">Заметка тренера</label>
                            <textarea
                                id="training-note"
                                rows={4}
                                value={trainerNote}
                                onChange={(event) => setTrainerNote(event.target.value)}
                            />
                        </div>

                        <div className="training-details-inline-actions">
                            <button
                                type="submit"
                                className="dashboard-btn dashboard-btn-primary"
                                disabled={isSavingTraining}
                            >
                                {isSavingTraining ? "Сохраняем..." : "Сохранить"}
                            </button>

                            <button
                                type="button"
                                className="dashboard-btn dashboard-btn-secondary"
                                onClick={() => setIsEditingTraining(false)}
                                disabled={isSavingTraining}
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {isCreateExerciseOpen && isTrainer && (
                <div
                    className="training-details-sheet-overlay"
                    onClick={resetCreateExerciseState}
                />
            )}

            {isCreateExerciseOpen && isTrainer && (
                <section className="training-details-panel training-details-panel-compact entity-panel-compact training-details-create-sheet">
                    <div className="training-details-section-head entity-section-head">
                        <h2 className="training-details-section-title entity-section-title">
                            Новое упражнение
                        </h2>

                        <button
                            type="button"
                            className="card-action-btn card-action-btn-neutral"
                            onClick={resetCreateExerciseState}
                            title="Закрыть"
                        >
                            ×
                        </button>
                    </div>

                    <div className="training-details-inline-form">
                        <div className="training-details-inline-actions" style={{ marginBottom: 8 }}>
                            <button
                                type="button"
                                className={
                                    createExerciseMode === "manual"
                                        ? "dashboard-btn dashboard-btn-primary"
                                        : "dashboard-btn dashboard-btn-secondary"
                                }
                                onClick={() => setCreateExerciseMode("manual")}
                            >
                                Вручную
                            </button>

                            <button
                                type="button"
                                className={
                                    createExerciseMode === "template"
                                        ? "dashboard-btn dashboard-btn-primary"
                                        : "dashboard-btn dashboard-btn-secondary"
                                }
                                onClick={() => setCreateExerciseMode("template")}
                            >
                                Из шаблона
                            </button>
                        </div>

                        {createExerciseMode === "manual" ? (
                            <form className="training-details-inline-form" onSubmit={handleCreateExercise}>
                                <div className="training-details-inline-grid training-details-inline-grid--exercise">
                                    <div className="form-row">
                                        <label htmlFor="exercise-title">Название</label>
                                        <input
                                            id="exercise-title"
                                            value={createExerciseForm.title}
                                            onChange={(event) =>
                                                setCreateExerciseForm((prev) => ({
                                                    ...prev,
                                                    title: event.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <label htmlFor="exercise-sets">Подходы</label>
                                        <input
                                            id="exercise-sets"
                                            type="number"
                                            min="0"
                                            value={createExerciseForm.sets}
                                            onChange={(event) =>
                                                setCreateExerciseForm((prev) => ({
                                                    ...prev,
                                                    sets: event.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="form-row" style={{ gridColumn: "span 2" }}>
                                        <label>Повторы</label>

                                        <div
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 8,
                                                marginBottom: 8,
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className={
                                                    createExerciseForm.repsMode === "EXACT"
                                                        ? "dashboard-btn dashboard-btn-primary"
                                                        : "dashboard-btn dashboard-btn-secondary"
                                                }
                                                onClick={() =>
                                                    setCreateExerciseForm((prev) =>
                                                        normalizeExerciseFormByMode(prev, "EXACT")
                                                    )
                                                }
                                            >
                                                Точно
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    createExerciseForm.repsMode === "RANGE"
                                                        ? "dashboard-btn dashboard-btn-primary"
                                                        : "dashboard-btn dashboard-btn-secondary"
                                                }
                                                onClick={() =>
                                                    setCreateExerciseForm((prev) =>
                                                        normalizeExerciseFormByMode(prev, "RANGE")
                                                    )
                                                }
                                            >
                                                Диапазон
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    createExerciseForm.repsMode === "NONE"
                                                        ? "dashboard-btn dashboard-btn-primary"
                                                        : "dashboard-btn dashboard-btn-secondary"
                                                }
                                                onClick={() =>
                                                    setCreateExerciseForm((prev) =>
                                                        normalizeExerciseFormByMode(prev, "NONE")
                                                    )
                                                }
                                            >
                                                Не указывать
                                            </button>
                                        </div>

                                        {createExerciseForm.repsMode === "EXACT" && (
                                            <input
                                                id="exercise-reps"
                                                type="number"
                                                min="1"
                                                value={createExerciseForm.repsValue}
                                                onChange={(event) =>
                                                    setCreateExerciseForm((prev) => ({
                                                        ...prev,
                                                        repsValue: event.target.value,
                                                    }))
                                                }
                                                placeholder="Например, 12"
                                            />
                                        )}

                                        {createExerciseForm.repsMode === "RANGE" && (
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                                    gap: 8,
                                                }}
                                            >
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={createExerciseForm.repsFrom}
                                                    onChange={(event) =>
                                                        setCreateExerciseForm((prev) => ({
                                                            ...prev,
                                                            repsFrom: event.target.value,
                                                        }))
                                                    }
                                                    placeholder="От"
                                                />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={createExerciseForm.repsTo}
                                                    onChange={(event) =>
                                                        setCreateExerciseForm((prev) => ({
                                                            ...prev,
                                                            repsTo: event.target.value,
                                                        }))
                                                    }
                                                    placeholder="До"
                                                />
                                            </div>
                                        )}

                                        {!createExerciseForm.repsMode && (
                                            <div
                                                style={{
                                                    color: "#64748b",
                                                    fontSize: 12,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                Выбери точное значение, диапазон или режим без повторений
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <label htmlFor="exercise-duration">Длительность, сек</label>
                                        <input
                                            id="exercise-duration"
                                            type="number"
                                            min="0"
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
                                    <label htmlFor="exercise-description">Описание</label>
                                    <textarea
                                        id="exercise-description"
                                        rows={3}
                                        value={createExerciseForm.description}
                                        onChange={(event) =>
                                            setCreateExerciseForm((prev) => ({
                                                ...prev,
                                                description: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="form-row">
                                    <label htmlFor="exercise-note">Заметка тренера</label>
                                    <textarea
                                        id="exercise-note"
                                        rows={3}
                                        value={createExerciseForm.trainerNote}
                                        onChange={(event) =>
                                            setCreateExerciseForm((prev) => ({
                                                ...prev,
                                                trainerNote: event.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="training-details-inline-actions">
                                    <button
                                        type="submit"
                                        className="dashboard-btn dashboard-btn-primary"
                                        disabled={isCreatingExercise}
                                    >
                                        {isCreatingExercise ? "Добавляем..." : "Добавить"}
                                    </button>

                                    <button
                                        type="button"
                                        className="dashboard-btn dashboard-btn-secondary"
                                        onClick={resetCreateExerciseState}
                                        disabled={isCreatingExercise}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="training-details-inline-form">
                                <div className="form-row">
                                    <label htmlFor="exercise-template-select">Шаблон упражнения</label>
                                    <select
                                        id="exercise-template-select"
                                        value={selectedTemplateId}
                                        onChange={(event) => setSelectedTemplateId(event.target.value)}
                                        disabled={isLoadingExerciseTemplates || exerciseTemplates.length === 0}
                                    >
                                        {exerciseTemplates.length === 0 ? (
                                            <option value="">Нет доступных шаблонов</option>
                                        ) : (
                                            exerciseTemplates.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                {isLoadingExerciseTemplates ? (
                                    <div className="training-empty-block">Загрузка шаблонов...</div>
                                ) : selectedTemplate ? (
                                    <div
                                        style={{
                                            padding: 16,
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 16,
                                            background: "#f8fafc",
                                            display: "grid",
                                            gap: 12,
                                        }}
                                    >
                                        <div style={{ display: "grid", gap: 6 }}>
                                            <h4 style={{ margin: 0 }}>{selectedTemplate.name}</h4>
                                            {selectedTemplate.description && (
                                                <div style={{ color: "#475569", fontSize: 14 }}>
                                                    {selectedTemplate.description}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {selectedTemplate.sets != null && (
                                                <span className="exercise-chip">
                                                    {selectedTemplate.sets} подх.
                                                </span>
                                            )}
                                            {selectedTemplate.repsMode !== "NONE" && (
                                                <span className="exercise-chip">
                                                    {getRepsDisplay(selectedTemplate)} повт.
                                                </span>
                                            )}
                                            {selectedTemplate.durationSeconds != null && (
                                                <span className="exercise-chip">
                                                    {selectedTemplate.durationSeconds} сек.
                                                </span>
                                            )}
                                            {selectedTemplate.restSeconds != null && (
                                                <span className="exercise-chip">
                                                    отдых {selectedTemplate.restSeconds} сек.
                                                </span>
                                            )}
                                        </div>

                                        {selectedTemplate.trainerNote && (
                                            <div style={{ color: "#334155", fontSize: 14 }}>
                                                <strong>Заметка тренера:</strong> {selectedTemplate.trainerNote}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="training-empty-block">
                                        Сначала создай шаблон упражнения в разделе «Шаблоны»
                                    </div>
                                )}

                                <div className="training-details-inline-actions">
                                    <button
                                        type="button"
                                        className="dashboard-btn dashboard-btn-primary"
                                        onClick={() => void handleCreateExerciseFromTemplate()}
                                        disabled={isCreatingExercise || !selectedTemplateId}
                                    >
                                        {isCreatingExercise ? "Добавляем..." : "Добавить из шаблона"}
                                    </button>

                                    <button
                                        type="button"
                                        className="dashboard-btn dashboard-btn-secondary"
                                        onClick={resetCreateExerciseState}
                                        disabled={isCreatingExercise}
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <section className="training-details-panel training-details-panel-compact entity-panel-compact">
                <div className="training-details-section-head entity-section-head">
                    <h2 className="training-details-section-title entity-section-title">
                        Упражнения
                    </h2>
                    <span className="entity-section-count">{sortedExercises.length}</span>
                </div>

                {isLoadingExercises ? (
                    <div className="training-empty-block">Загрузка упражнений...</div>
                ) : sortedExercises.length === 0 ? (
                    <div className="training-empty-block">
                        Упражнений пока нет. Добавь первое упражнение.
                    </div>
                ) : (
                    <section className="exercise-compact-list">
                        {sortedExercises.map((exercise) => {
                            const isExpanded = expandedExerciseId === exercise.id;
                            const isEditing = editingExerciseId === exercise.id;

                            return (
                                <article
                                    key={exercise.id}
                                    className={`exercise-compact-card ${isExpanded ? "is-expanded" : ""}`}
                                >
                                    <div className="exercise-compact-row">
                                        <div className="exercise-compact-order">{exercise.orderNum}</div>

                                        <div className="exercise-compact-main">
                                            <div className="exercise-compact-top">
                                                <div className="exercise-compact-title-block">
                                                    <div className="exercise-compact-title">{exercise.title}</div>
                                                    <div className="exercise-compact-summary">
                                                        {formatExerciseSummary(exercise)}
                                                    </div>
                                                </div>

                                                <div className={getExerciseStatusClass(exercise, isExpanded)}>
                                                    {getExerciseStatusLabel(exercise, isExpanded)}
                                                </div>
                                            </div>

                                            {exercise.trainerNote && !isExpanded && (
                                                <div className="exercise-compact-note-preview">
                                                    {exercise.trainerNote}
                                                </div>
                                            )}
                                        </div>

                                        <div className="exercise-compact-actions">
                                            <button
                                                type="button"
                                                className="card-action-btn card-action-btn-neutral"
                                                onClick={() =>
                                                    setExpandedExerciseId((current) =>
                                                        current === exercise.id ? null : exercise.id
                                                    )
                                                }
                                                title="Открыть"
                                            >
                                                {isExpanded ? "˄" : "›"}
                                            </button>

                                            {isTrainer && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="card-action-btn card-action-btn-neutral"
                                                        onClick={() => void handleMoveExercise(exercise.id, -1)}
                                                        disabled={
                                                            movingExerciseId === exercise.id ||
                                                            sortedExercises[0]?.id === exercise.id
                                                        }
                                                        title="Выше"
                                                    >
                                                        ↑
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="card-action-btn card-action-btn-neutral"
                                                        onClick={() => void handleMoveExercise(exercise.id, 1)}
                                                        disabled={
                                                            movingExerciseId === exercise.id ||
                                                            sortedExercises[sortedExercises.length - 1]?.id === exercise.id
                                                        }
                                                        title="Ниже"
                                                    >
                                                        ↓
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="card-action-btn card-action-btn-success"
                                                        onClick={() =>
                                                            void handleToggleCompletion(exercise, !exercise.isCompleted)
                                                        }
                                                        disabled={togglingExerciseId === exercise.id}
                                                        title={
                                                            exercise.isCompleted
                                                                ? "Снять выполнение"
                                                                : "Отметить выполненным"
                                                        }
                                                    >
                                                        {togglingExerciseId === exercise.id
                                                            ? "..."
                                                            : exercise.isCompleted
                                                                ? "↺"
                                                                : "✓"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="card-action-btn card-action-btn-neutral"
                                                        onClick={() => startEditExercise(exercise)}
                                                        title="Редактировать"
                                                    >
                                                        ✎
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="card-action-btn card-action-btn-danger"
                                                        onClick={() => void handleDeleteExercise(exercise.id)}
                                                        disabled={deletingExerciseId === exercise.id}
                                                        title="Удалить"
                                                    >
                                                        {deletingExerciseId === exercise.id ? "..." : "×"}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="exercise-compact-expanded">
                                            {isEditing ? (
                                                <div className="exercise-compact-editor">
                                                    <div className="training-details-inline-grid training-details-inline-grid--exercise">
                                                        <div className="form-row">
                                                            <label>Название</label>
                                                            <input
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
                                                            <label>Подходы</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={editExerciseForm.sets}
                                                                onChange={(event) =>
                                                                    setEditExerciseForm((prev) => ({
                                                                        ...prev,
                                                                        sets: event.target.value,
                                                                    }))
                                                                }
                                                            />
                                                        </div>

                                                        <div className="form-row" style={{ gridColumn: "span 2" }}>
                                                            <label>Повторы</label>

                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    flexWrap: "wrap",
                                                                    gap: 8,
                                                                    marginBottom: 8,
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        editExerciseForm.repsMode === "EXACT"
                                                                            ? "dashboard-btn dashboard-btn-primary"
                                                                            : "dashboard-btn dashboard-btn-secondary"
                                                                    }
                                                                    onClick={() =>
                                                                        setEditExerciseForm((prev) =>
                                                                            normalizeExerciseFormByMode(prev, "EXACT")
                                                                        )
                                                                    }
                                                                >
                                                                    Точно
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        editExerciseForm.repsMode === "RANGE"
                                                                            ? "dashboard-btn dashboard-btn-primary"
                                                                            : "dashboard-btn dashboard-btn-secondary"
                                                                    }
                                                                    onClick={() =>
                                                                        setEditExerciseForm((prev) =>
                                                                            normalizeExerciseFormByMode(prev, "RANGE")
                                                                        )
                                                                    }
                                                                >
                                                                    Диапазон
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        editExerciseForm.repsMode === "NONE"
                                                                            ? "dashboard-btn dashboard-btn-primary"
                                                                            : "dashboard-btn dashboard-btn-secondary"
                                                                    }
                                                                    onClick={() =>
                                                                        setEditExerciseForm((prev) =>
                                                                            normalizeExerciseFormByMode(prev, "NONE")
                                                                        )
                                                                    }
                                                                >
                                                                    Не указывать
                                                                </button>
                                                            </div>

                                                            {editExerciseForm.repsMode === "EXACT" && (
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={editExerciseForm.repsValue}
                                                                    onChange={(event) =>
                                                                        setEditExerciseForm((prev) => ({
                                                                            ...prev,
                                                                            repsValue: event.target.value,
                                                                        }))
                                                                    }
                                                                    placeholder="Например, 12"
                                                                />
                                                            )}

                                                            {editExerciseForm.repsMode === "RANGE" && (
                                                                <div
                                                                    style={{
                                                                        display: "grid",
                                                                        gridTemplateColumns:
                                                                            "repeat(2, minmax(0, 1fr))",
                                                                        gap: 8,
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={editExerciseForm.repsFrom}
                                                                        onChange={(event) =>
                                                                            setEditExerciseForm((prev) => ({
                                                                                ...prev,
                                                                                repsFrom: event.target.value,
                                                                            }))
                                                                        }
                                                                        placeholder="От"
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={editExerciseForm.repsTo}
                                                                        onChange={(event) =>
                                                                            setEditExerciseForm((prev) => ({
                                                                                ...prev,
                                                                                repsTo: event.target.value,
                                                                            }))
                                                                        }
                                                                        placeholder="До"
                                                                    />
                                                                </div>
                                                            )}

                                                            {!editExerciseForm.repsMode && (
                                                                <div
                                                                    style={{
                                                                        color: "#64748b",
                                                                        fontSize: 12,
                                                                        lineHeight: 1.4,
                                                                    }}
                                                                >
                                                                    Выбери точное значение, диапазон или режим без повторений
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="form-row">
                                                            <label>Длительность, сек</label>
                                                            <input
                                                                type="number"
                                                                min="0"
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
                                                        <label>Описание</label>
                                                        <textarea
                                                            rows={3}
                                                            value={editExerciseForm.description}
                                                            onChange={(event) =>
                                                                setEditExerciseForm((prev) => ({
                                                                    ...prev,
                                                                    description: event.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </div>

                                                    <div className="form-row">
                                                        <label>Заметка тренера</label>
                                                        <textarea
                                                            rows={3}
                                                            value={editExerciseForm.trainerNote}
                                                            onChange={(event) =>
                                                                setEditExerciseForm((prev) => ({
                                                                    ...prev,
                                                                    trainerNote: event.target.value,
                                                                }))
                                                            }
                                                        />
                                                    </div>

                                                    <div className="training-details-inline-actions">
                                                        <button
                                                            type="button"
                                                            className="dashboard-btn dashboard-btn-primary"
                                                            onClick={() => void handleSaveExercise(exercise.id)}
                                                            disabled={savingExerciseId === exercise.id}
                                                        >
                                                            {savingExerciseId === exercise.id ? "Сохраняем..." : "Сохранить"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="dashboard-btn dashboard-btn-secondary"
                                                            onClick={cancelEditExercise}
                                                            disabled={savingExerciseId === exercise.id}
                                                        >
                                                            Отмена
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="exercise-compact-details">
                                                    {exercise.description && (
                                                        <div className="exercise-compact-detail">
                                                            <span>Описание</span>
                                                            <strong>{exercise.description}</strong>
                                                        </div>
                                                    )}

                                                    <div className="exercise-compact-detail-grid">
                                                        <div className="exercise-compact-detail">
                                                            <span>Подходы</span>
                                                            <strong>{exercise.sets ?? "—"}</strong>
                                                        </div>

                                                        <div className="exercise-compact-detail">
                                                            <span>Повторы</span>
                                                            <strong>{getRepsDisplay(exercise)}</strong>
                                                        </div>

                                                        <div className="exercise-compact-detail">
                                                            <span>Длительность</span>
                                                            <strong>
                                                                {exercise.durationSeconds != null
                                                                    ? `${exercise.durationSeconds} сек`
                                                                    : "—"}
                                                            </strong>
                                                        </div>

                                                        <div className="exercise-compact-detail">
                                                            <span>Отдых</span>
                                                            <strong>
                                                                {exercise.restSeconds != null
                                                                    ? `${exercise.restSeconds} сек`
                                                                    : "—"}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <div className="exercise-compact-detail-grid">
                                                        <div className="exercise-compact-detail">
                                                            <span>Заметка тренера</span>
                                                            <strong>{exercise.trainerNote || "Нет заметки"}</strong>
                                                        </div>

                                                        <div className="exercise-compact-detail">
                                                            <span>Заметка клиента</span>
                                                            <strong>{exercise.clientNote || "Нет заметки"}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </section>
                )}
            </section>
        </div>
    );
}