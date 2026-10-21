import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Avatar from "../shared/ui/Avatar";
import { useAuth } from "../features/auth/model/AuthContext";
import ExercisePickerSheet from "../features/training/ui/ExercisePickerSheet";
import ExerciseDetailForm from "../features/training/ui/ExerciseDetailForm";
import { trainingApi } from "../shared/api/trainingApi";
import { trainingExerciseApi } from "../shared/api/trainingExerciseApi";
import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";
import { setsBreakdown, summaryFromParts } from "../features/training/model/trainingDraft";
import {
    exerciseFields,
    formatTimer,
    hasInvalidTimer,
    newStation,
    stationFieldsPayload,
    stationFromExercise,
    type CircuitStation,
} from "../features/training/model/circuit";
import CircuitStationEditor from "../features/training/ui/CircuitStationEditor";
import CircuitTimer from "../features/training/ui/CircuitTimer";
import {
    getInitials,
    avatarColor,
    formatDaySubtitle,
} from "../features/calendar/lib/calendarWeek";

import type { TrainingResponse } from "../features/training/model/training.types";
import type {
    TrainingExerciseResponse,
    UpdateTrainingExerciseRequest,
} from "../features/training-exercise/model/trainingExercise.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function clientName(t: TrainingResponse): string {
    const full = [t.clientFirstName, t.clientLastName].filter(Boolean).join(" ").trim();
    return full || t.clientEmail || `Клиент #${t.clientId}`;
}

function time(value: string | null): string {
    return value ? value.slice(0, 5) : "—";
}

/** Circuit station fields in order: "<текст> · Секундомер 1:30 · …". */
function circuitSummary(ex: TrainingExerciseResponse): string {
    const parts = exerciseFields(ex).map((f) =>
        f.type === "TIMER" ? `Секундомер ${formatTimer(f.seconds ?? 0)}` : (f.text ?? "")
    );
    return parts.length ? parts.join(" · ") : "Без параметров";
}

function circuitTimers(ex: TrainingExerciseResponse): number[] {
    return exerciseFields(ex)
        .filter((f) => f.type === "TIMER" && f.seconds != null && f.seconds > 0)
        .map((f) => f.seconds as number);
}

function exerciseSummary(ex: TrainingExerciseResponse): string {
    const breakdown = setsBreakdown(ex.setDetails);
    if (breakdown) {
        const parts = [`${ex.setDetails.length} подх.: ${breakdown}`];
        if (ex.durationSeconds != null) parts.push(`${ex.durationSeconds} сек`);
        return parts.join(" · ");
    }

    return summaryFromParts({
        repsDisplay: ex.repsMode !== "NONE" ? ex.repsDisplay : null,
        durationSeconds: ex.durationSeconds,
        weight: ex.weight,
        sets: ex.sets,
    });
}

const STATUS_PILL: Record<string, { label: string; cls: string } | null> = {
    PLANNED: null,
    COMPLETED: { label: "Завершена", cls: "fb-pill--ok" },
    CANCELLED: { label: "Отменена", cls: "fb-pill--muted" },
};

export default function TrainingDetailsPage() {
    const navigate = useNavigate();
    const { trainingId } = useParams<{ trainingId: string }>();
    const id = Number(trainingId);
    const { currentUser } = useAuth();
    const isClient = currentUser?.role === "CLIENT";

    const [training, setTraining] = useState<TrainingResponse | null>(null);
    const [exercises, setExercises] = useState<TrainingExerciseResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [editing, setEditing] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [exerciseSheetOpen, setExerciseSheetOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState<TrainingExerciseResponse | null>(null);
    // Circuit station sheet: exerciseId null — a new station.
    const [stationDraft, setStationDraft] = useState<{ exerciseId: number | null; station: CircuitStation } | null>(null);
    const [stationError, setStationError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // edit fields
    const [date, setDate] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [comment, setComment] = useState("");

    const loadExercises = useCallback(async () => {
        const data = await trainingExerciseApi.getExercises(id);
        setExercises(data);
    }, [id]);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const t = await trainingApi.getTraining(id);
            setTraining(t);
            setDate(t.trainingDate);
            setStart(time(t.startTime));
            setEnd(time(t.endTime));
            setComment(t.trainerNote ?? "");
            await loadExercises();
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить тренировку"));
        } finally {
            setIsLoading(false);
        }
    }, [id, loadExercises]);

    useEffect(() => {
        void load();
    }, [load]);

    const handleSave = async () => {
        if (end <= start) {
            setErrorMessage("Время окончания должно быть позже начала");
            return;
        }
        setErrorMessage("");
        setIsSaving(true);
        try {
            const updated = await trainingApi.updateTraining(id, {
                trainingDate: date,
                startTime: start,
                endTime: end,
                trainerNote: comment.trim() || undefined,
            });
            setTraining(updated);
            setEditing(false);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось сохранить тренировку"));
        } finally {
            setIsSaving(false);
        }
    };

    const runAction = async (action: () => Promise<unknown>, fallback: string) => {
        setMenuOpen(false);
        setErrorMessage("");
        try {
            await action();
            await load();
        } catch (error) {
            setErrorMessage(resolveApiError(error, fallback));
        }
    };

    const handleDelete = () => {
        const question = training?.status === "COMPLETED"
            ? "Удалить проведённую тренировку из расписания? Она останется списанной с договора и в отчёте. Чтобы вернуть её на договор, используйте «Вернуть в план»."
            : "Удалить тренировку?";
        if (!window.confirm(question)) return;
        setMenuOpen(false);
        (async () => {
            try {
                await trainingApi.cancelTraining(id);
                navigate("/me");
            } catch (error) {
                setErrorMessage(resolveApiError(error, "Не удалось удалить тренировку"));
            }
        })();
    };

    const addExerciseFromPicker = async (
        source:
            | { kind: "template"; templateId: number }
            | { kind: "custom"; payload: Parameters<typeof trainingExerciseApi.createExercise>[1] }
    ) => {
        try {
            if (source.kind === "template") {
                await exerciseTemplateApi.addTemplateToTraining(id, { templateId: source.templateId });
            } else {
                await trainingExerciseApi.createExercise(id, source.payload);
            }
            await loadExercises();
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось добавить упражнение"));
        }
    };

    const removeExercise = async (exerciseId: number) => {
        try {
            await trainingExerciseApi.deleteExercise(id, exerciseId);
            await loadExercises();
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось убрать упражнение"));
        }
    };

    const saveExercise = async (exerciseId: number, payload: UpdateTrainingExerciseRequest) => {
        try {
            const updated = await trainingExerciseApi.updateExercise(id, exerciseId, payload);
            setExercises((prev) => prev.map((item) => (item.id === exerciseId ? updated : item)));
            setEditingExercise(null);
        } catch (error) {
            // Keep the sheet open so the trainer doesn't lose the input; the form shows the message.
            throw new Error(resolveApiError(error, "Не удалось сохранить упражнение"));
        }
    };

    const openStation = (ex: TrainingExerciseResponse | null) => {
        setStationError("");
        setStationDraft(ex ? { exerciseId: ex.id, station: stationFromExercise(ex) } : { exerciseId: null, station: newStation() });
    };

    const saveStation = async () => {
        if (!stationDraft) return;
        const { exerciseId, station } = stationDraft;
        if (!station.title.trim()) {
            setStationError("Укажите название упражнения");
            return;
        }
        if (hasInvalidTimer(station)) {
            setStationError("Секундомер: укажите время в формате мм:сс, например 1:30");
            return;
        }
        setStationError("");
        setIsSaving(true);
        try {
            const fields = stationFieldsPayload(station);
            if (exerciseId == null) {
                await trainingExerciseApi.createExercise(id, { title: station.title.trim(), repsMode: "NONE", fields });
                await loadExercises();
            } else {
                // Legacy stations kept text/timer in description/duration — clear them once fields are saved.
                const updated = await trainingExerciseApi.updateExercise(id, exerciseId, {
                    title: station.title.trim(),
                    description: "",
                    fields,
                });
                setExercises((prev) => prev.map((item) => (item.id === exerciseId ? updated : item)));
            }
            setStationDraft(null);
        } catch (error) {
            setStationError(resolveApiError(error, "Не удалось сохранить упражнение"));
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCompletion = async (ex: TrainingExerciseResponse) => {
        try {
            const updated = await trainingExerciseApi.updateCompletion(id, ex.id, {
                isCompleted: !ex.isCompleted,
            });
            setExercises((prev) => prev.map((item) => (item.id === ex.id ? updated : item)));
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось обновить упражнение"));
        }
    };

    if (isLoading) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
                    <h1 className="fb-topbar__title">Тренировка</h1>
                </header>
                <div className="fb-cal-status">Загрузка…</div>
            </div>
        );
    }

    if (!training) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
                    <h1 className="fb-topbar__title">Тренировка</h1>
                </header>
                <div className="fb-cal-error">{errorMessage || "Тренировка не найдена"}</div>
            </div>
        );
    }

    const status = training.status;
    const pill = STATUS_PILL[status] ?? null;
    const canEditExercises = !isClient && status !== "CANCELLED";
    const isCircuit = training.trainingType === "CIRCUIT";
    const rowTitle = (ex: TrainingExerciseResponse, index: number) => (isCircuit ? `${index + 1}. ${ex.title}` : ex.title);
    const rowSub = (ex: TrainingExerciseResponse) => (isCircuit ? circuitSummary(ex) : exerciseSummary(ex));

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => (editing ? setEditing(false) : navigate(-1))}>‹</button>
                <h1 className="fb-topbar__title">Тренировка</h1>

                {!editing && (!isClient || status === "PLANNED") && (
                    <button type="button" className="fb-topbar__action" aria-label="Меню" onClick={() => setMenuOpen((v) => !v)}>
                        ⋮
                    </button>
                )}

                {menuOpen && (
                    <>
                        <button type="button" className="fb-overlay" aria-label="Закрыть" onClick={() => setMenuOpen(false)} />
                        <div className="fb-menu" role="menu">
                            {isClient ? (
                                <button type="button" className="fb-menu__item" onClick={() => { setMenuOpen(false); navigate(`/trainings/${id}/reschedule-request`); }}>
                                    Перенести
                                </button>
                            ) : (
                            <>
                            {status !== "CANCELLED" && (
                                <button type="button" className="fb-menu__item" onClick={() => { setMenuOpen(false); setEditing(true); }}>
                                    Редактировать
                                </button>
                            )}
                            {status === "PLANNED" && (
                                <button type="button" className="fb-menu__item" onClick={() => void runAction(() => trainingApi.completeTraining(id), "Не удалось завершить")}>
                                    Завершить
                                </button>
                            )}
                            {status !== "PLANNED" && (
                                <button type="button" className="fb-menu__item" onClick={() => void runAction(() => trainingApi.restoreTrainingToPlanned(id), "Не удалось вернуть в план")}>
                                    Вернуть в план
                                </button>
                            )}
                            {status !== "CANCELLED" && (
                                <button type="button" className="fb-menu__item fb-menu__item--danger" onClick={handleDelete}>
                                    Удалить
                                </button>
                            )}
                            </>
                            )}
                        </div>
                    </>
                )}
            </header>

            <div className="fb-body">
                <div className="fb-training-client">
                    <Avatar
                        initials={getInitials(training.clientFirstName, training.clientLastName, training.clientEmail?.[0]?.toUpperCase() ?? "K")}
                        color={avatarColor(training.clientId)}
                        size="md"
                    />
                    <div className="fb-training-client__main">
                        <div className="fb-training-client__label">Клиент</div>
                        <div className="fb-training-client__name">{clientName(training)}</div>
                    </div>
                    {pill && <span className={`fb-pill ${pill.cls}`}>{pill.label}</span>}
                </div>

                {isCircuit && (
                    <>
                        <ReadonlyRow label="Круговая тренировка" value={training.title ?? "—"} />
                        {training.description && <ReadonlyRow label="Описание" value={training.description} />}
                    </>
                )}

                {editing ? (
                    <>
                        <FieldDate value={date} onChange={setDate} />
                        <FieldTime label="Начало" value={start} onChange={setStart} />
                        <FieldTime label="Конец" value={end} onChange={setEnd} />
                        <ReadonlyRow label="Повтор" value="Никогда" />
                        <label className="fb-textarea">
                            <span className="fb-textarea__label">Комментарий</span>
                            <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
                        </label>
                    </>
                ) : (
                    <>
                        <ReadonlyRow label="Дата" value={formatDaySubtitle(training.trainingDate)} />
                        <ReadonlyRow label="Начало" value={time(training.startTime)} />
                        <ReadonlyRow label="Конец" value={time(training.endTime)} />
                        <ReadonlyRow label="Повтор" value="Никогда" />
                        {training.trainerNote && <ReadonlyRow label="Комментарий" value={training.trainerNote} />}
                    </>
                )}

                <div className="fb-section-title fb-section-title--flush">
                    Упражнения {exercises.length > 0 ? `· ${exercises.length}` : ""}
                </div>

                {canEditExercises && exercises.length > 0 && (
                    <div className="fb-hint">Нажмите на упражнение, чтобы изменить его поля</div>
                )}

                {exercises.length === 0 ? (
                    <div className="fb-empty">Упражнений пока нет</div>
                ) : (
                    <div className="fb-list">
                        {exercises.map((ex, index) => (
                            <Fragment key={ex.id}>
                            <div className="fb-row">
                                {!editing && (
                                    <button
                                        type="button"
                                        className={`fb-row__radio ${ex.isCompleted ? "fb-row__radio--checked" : ""}`}
                                        aria-label={ex.isCompleted ? "Отметить невыполненным" : "Отметить выполненным"}
                                        onClick={() => void toggleCompletion(ex)}
                                    >
                                        {ex.isCompleted ? "✓" : ""}
                                    </button>
                                )}
                                {canEditExercises ? (
                                    <button
                                        type="button"
                                        className="fb-row__main fb-row__main--button"
                                        aria-label={`Редактировать упражнение ${ex.title}`}
                                        onClick={() => (isCircuit ? openStation(ex) : setEditingExercise(ex))}
                                    >
                                        <span className="fb-row__title">{rowTitle(ex, index)}</span>
                                        <span className="fb-row__sub">{rowSub(ex)}</span>
                                    </button>
                                ) : (
                                    <span className="fb-row__main">
                                        <span className="fb-row__title">{rowTitle(ex, index)}</span>
                                        <span className="fb-row__sub">{rowSub(ex)}</span>
                                    </span>
                                )}
                                {editing && (
                                    <button type="button" className="fb-row__remove" aria-label="Убрать" onClick={() => void removeExercise(ex.id)}>
                                        ×
                                    </button>
                                )}
                            </div>
                            {isCircuit && !editing && status !== "CANCELLED" && circuitTimers(ex).length > 0 && (
                                <div className="fb-timers">
                                    {circuitTimers(ex).map((seconds, i) => (
                                        <CircuitTimer key={`${ex.id}-${i}-${seconds}`} seconds={seconds} />
                                    ))}
                                </div>
                            )}
                            </Fragment>
                        ))}
                    </div>
                )}

                {editing && (
                    <button type="button" className="fb-add-link" onClick={() => (isCircuit ? openStation(null) : setExerciseSheetOpen(true))}>
                        + Добавить упражнение
                    </button>
                )}

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                {!editing && !isClient && status !== "CANCELLED" && (
                    <button
                        type="button"
                        className="fb-fab fb-fab--flush"
                        aria-label="Добавить упражнение"
                        onClick={() => (isCircuit ? openStation(null) : setExerciseSheetOpen(true))}
                    >
                        +
                    </button>
                )}

                {editing && (
                    <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Сохраняем…" : "Сохранить"}
                    </button>
                )}
            </div>

            {exerciseSheetOpen && (
                <ExercisePickerSheet
                    onPick={(draft) => void addExerciseFromPicker(draft.source)}
                    onClose={() => setExerciseSheetOpen(false)}
                />
            )}

            {editingExercise && (
                <>
                    <button type="button" className="fb-sheet-backdrop" aria-label="Закрыть" onClick={() => setEditingExercise(null)} />
                    <div className="fb-sheet fb-sheet--tall" role="dialog" aria-label="Редактирование упражнения">
                        <ExerciseDetailForm
                            key={editingExercise.id}
                            exercise={editingExercise}
                            onSave={(payload) => saveExercise(editingExercise.id, payload)}
                        />
                    </div>
                </>
            )}

            {stationDraft && (
                <>
                    <button type="button" className="fb-sheet-backdrop" aria-label="Закрыть" onClick={() => setStationDraft(null)} />
                    <div className="fb-sheet fb-sheet--tall" role="dialog" aria-label="Упражнение круговой тренировки">
                        <div className="fb-sheet__scroll fb-pad">
                            <div className="fb-circuit">
                                <CircuitStationEditor
                                    station={stationDraft.station}
                                    number={
                                        stationDraft.exerciseId == null
                                            ? exercises.length + 1
                                            : exercises.findIndex((ex) => ex.id === stationDraft.exerciseId) + 1
                                    }
                                    onChange={(station) => setStationDraft({ ...stationDraft, station })}
                                />
                            </div>
                            {stationError ? <div className="fb-cal-error">{stationError}</div> : null}
                            <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={() => void saveStation()} disabled={isSaving}>
                                {isSaving ? "Сохраняем…" : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function ReadonlyRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="fb-readonly">
            <span className="fb-readonly__label">{label}</span>
            <span className="fb-readonly__value">{value}</span>
        </div>
    );
}

function FieldDate({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="fb-field">
            <label className="fb-field__label" htmlFor="td-date">Дата</label>
            <div className="fb-field__control">
                <input id="td-date" className="fb-field__input" type="date" value={value} onChange={(e) => onChange(e.target.value)} />
            </div>
        </div>
    );
}

function FieldTime({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="fb-field">
            <label className="fb-field__label">{label}</label>
            <div className="fb-field__control">
                <input className="fb-field__input" type="time" value={value} onChange={(e) => onChange(e.target.value)} />
            </div>
        </div>
    );
}
