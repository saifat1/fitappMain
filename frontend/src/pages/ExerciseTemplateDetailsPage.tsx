import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    ExerciseTemplateResponse,
    RepsMode,
    UpdateExerciseTemplateRequest,
} from "../features/exercise-template/model/exerciseTemplate.types";
import styles from "./ExerciseTemplatesPage.module.css";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function buildRepsDisplay(
    repsMode: "" | RepsMode,
    repsValue: string,
    repsFrom: string,
    repsTo: string
): string {
    if (!repsMode || repsMode === "NONE") {
        return "—";
    }

    if (repsMode === "EXACT") {
        return repsValue.trim() || "—";
    }

    if (repsMode === "RANGE") {
        if (repsFrom.trim() && repsTo.trim()) {
            return `${repsFrom.trim()}–${repsTo.trim()}`;
        }
    }

    return "—";
}

function formatWeightDisplay(weight: string): string {
    const normalized = weight.trim();
    return normalized ? `${normalized} кг` : "—";
}

export default function ExerciseTemplateDetailsPage() {
    const { templateId } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<ExerciseTemplateResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sets, setSets] = useState("");
    const [repsMode, setRepsMode] = useState<"" | RepsMode>("");
    const [repsValue, setRepsValue] = useState("");
    const [repsFrom, setRepsFrom] = useState("");
    const [repsTo, setRepsTo] = useState("");
    const [weight, setWeight] = useState("");
    const [durationSeconds, setDurationSeconds] = useState("");
    const [restSeconds, setRestSeconds] = useState("");
    const [trainerNote, setTrainerNote] = useState("");

    useEffect(() => {
        async function load() {
            if (!templateId) {
                setErrorMessage("Не указан шаблон");
                setIsLoading(false);
                return;
            }

            setErrorMessage("");
            setIsLoading(true);

            try {
                const data = await exerciseTemplateApi.getTemplate(Number(templateId));
                setTemplate(data);
                setName(data.name);
                setDescription(data.description ?? "");
                setSets(data.sets != null ? String(data.sets) : "");
                setRepsMode(data.repsMode ?? "NONE");
                setRepsValue(
                    data.repsMode === "EXACT" && data.repsValue != null
                        ? String(data.repsValue)
                        : ""
                );
                setRepsFrom(
                    data.repsMode === "RANGE" && data.repsFrom != null
                        ? String(data.repsFrom)
                        : ""
                );
                setRepsTo(
                    data.repsMode === "RANGE" && data.repsTo != null
                        ? String(data.repsTo)
                        : ""
                );
                setWeight(data.weight != null ? String(data.weight) : "");
                setDurationSeconds(
                    data.durationSeconds != null ? String(data.durationSeconds) : ""
                );
                setRestSeconds(data.restSeconds != null ? String(data.restSeconds) : "");
                setTrainerNote(data.trainerNote ?? "");
            } catch (error) {
                setErrorMessage(resolveApiError(error, "Не удалось загрузить шаблон"));
            } finally {
                setIsLoading(false);
            }
        }

        void load();
    }, [templateId]);

    const handleSave = async () => {
        if (!templateId) {
            return;
        }

        if (!name.trim()) {
            setErrorMessage("Укажи название шаблона");
            return;
        }

        if (!repsMode) {
            setErrorMessage("Укажи режим повторений");
            return;
        }

        if (repsMode === "EXACT") {
            const exact = Number(repsValue);
            if (!repsValue.trim() || Number.isNaN(exact) || exact < 1) {
                setErrorMessage("Для точных повторений укажи положительное число");
                return;
            }
        }

        if (repsMode === "RANGE") {
            const from = Number(repsFrom);
            const to = Number(repsTo);

            if (
                !repsFrom.trim() ||
                !repsTo.trim() ||
                Number.isNaN(from) ||
                Number.isNaN(to) ||
                from < 1 ||
                to < 1
            ) {
                setErrorMessage("Для диапазона повторений укажи две положительные границы");
                return;
            }

            if (from > to) {
                setErrorMessage("Нижняя граница повторений не может быть больше верхней");
                return;
            }
        }

        if (weight.trim()) {
            const parsedWeight = Number(weight.replace(",", "."));

            if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
                setErrorMessage("Вес должен быть положительным числом");
                return;
            }
        }

        setErrorMessage("");
        setIsSaving(true);

        const payload: UpdateExerciseTemplateRequest = {
            name: name.trim(),
            description: description.trim() || undefined,
            sets: sets.trim() ? Number(sets) : undefined,
            repsMode: repsMode || undefined,
            repsValue:
                repsMode === "EXACT" && repsValue.trim() ? Number(repsValue) : undefined,
            repsFrom:
                repsMode === "RANGE" && repsFrom.trim() ? Number(repsFrom) : undefined,
            repsTo: repsMode === "RANGE" && repsTo.trim() ? Number(repsTo) : undefined,
            weight: weight.trim() ? Number(weight.replace(",", ".")) : undefined,
            durationSeconds: durationSeconds.trim()
                ? Number(durationSeconds)
                : undefined,
            restSeconds: restSeconds.trim() ? Number(restSeconds) : undefined,
            trainerNote: trainerNote.trim() || undefined,
        };

        try {
            const updated = await exerciseTemplateApi.updateTemplate(
                Number(templateId),
                payload
            );
            setTemplate(updated);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось сохранить шаблон"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (!template) {
        return (
            <div className={styles.page}>
                {errorMessage && <div className={styles.error}>{errorMessage}</div>}
                <div className={styles.empty}>Шаблон не найден</div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <section className={styles.header}>
                <div className={styles.headerMain}>
                    <h1 className={styles.title}>Шаблон упражнения</h1>
                    <p className={styles.subtitle}>
                        Редактирование шаблона упражнения
                    </p>
                </div>

                <div className={styles.headerActions}>
          <span className={`${styles.badge} ${template.isArchived ? styles.badgeArchived : styles.badgeActive}`}>
            {template.isArchived ? "Архив" : "Активен"}
          </span>

                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary"
                        onClick={() => navigate("/exercise-templates")}
                    >
                        Назад к списку
                    </button>
                </div>
            </section>

            {errorMessage && <div className={styles.error}>{errorMessage}</div>}

            <section className={styles.panel}>
                <div className={styles.panelHead}>
                    <div>
                        <h2 className={styles.panelTitle}>Параметры шаблона</h2>
                        <div className={styles.panelMeta}>
                            ID {template.id}
                        </div>
                    </div>
                </div>

                <div className={styles.detailForm}>
                    <div className={styles.detailGridForm}>
                        <div className={styles.row}>
                            <label htmlFor="template-details-name">Название</label>
                            <input
                                id="template-details-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-details-sets">Подходы</label>
                            <input
                                id="template-details-sets"
                                inputMode="numeric"
                                value={sets}
                                onChange={(event) => setSets(event.target.value)}
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-details-weight">Вес, кг</label>
                            <input
                                id="template-details-weight"
                                inputMode="decimal"
                                value={weight}
                                onChange={(event) => setWeight(event.target.value)}
                                placeholder="Например, 12.5"
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-details-duration">Длительность, сек</label>
                            <input
                                id="template-details-duration"
                                inputMode="numeric"
                                value={durationSeconds}
                                onChange={(event) => setDurationSeconds(event.target.value)}
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-details-rest">Отдых, сек</label>
                            <input
                                id="template-details-rest"
                                inputMode="numeric"
                                value={restSeconds}
                                onChange={(event) => setRestSeconds(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.detailGrid}>
                        <div className={styles.detail}>
                            <span>Повторы</span>
                            <strong>{buildRepsDisplay(repsMode, repsValue, repsFrom, repsTo)}</strong>
                        </div>

                        <div className={styles.detail}>
                            <span>Вес</span>
                            <strong>{formatWeightDisplay(weight)}</strong>
                        </div>
                    </div>

                    <div className={styles.detailGridForm}>
                        <div className={styles.row}>
                            <label htmlFor="template-details-reps-mode">Режим повторений</label>
                            <select
                                id="template-details-reps-mode"
                                value={repsMode}
                                onChange={(event) => {
                                    const nextMode = event.target.value as "" | RepsMode;
                                    setRepsMode(nextMode);

                                    if (nextMode !== "EXACT") {
                                        setRepsValue("");
                                    }

                                    if (nextMode !== "RANGE") {
                                        setRepsFrom("");
                                        setRepsTo("");
                                    }
                                }}
                            >
                                <option value="">Выбери режим</option>
                                <option value="NONE">Без повторений</option>
                                <option value="EXACT">Точное значение</option>
                                <option value="RANGE">Диапазон</option>
                            </select>
                        </div>

                        {repsMode === "EXACT" && (
                            <div className={styles.row}>
                                <label htmlFor="template-details-reps-value">Повторы</label>
                                <input
                                    id="template-details-reps-value"
                                    inputMode="numeric"
                                    value={repsValue}
                                    onChange={(event) => setRepsValue(event.target.value)}
                                />
                            </div>
                        )}

                        {repsMode === "RANGE" && (
                            <>
                                <div className={styles.row}>
                                    <label htmlFor="template-details-reps-from">Повторы от</label>
                                    <input
                                        id="template-details-reps-from"
                                        inputMode="numeric"
                                        value={repsFrom}
                                        onChange={(event) => setRepsFrom(event.target.value)}
                                    />
                                </div>

                                <div className={styles.row}>
                                    <label htmlFor="template-details-reps-to">Повторы до</label>
                                    <input
                                        id="template-details-reps-to"
                                        inputMode="numeric"
                                        value={repsTo}
                                        onChange={(event) => setRepsTo(event.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.row}>
                        <label htmlFor="template-details-description">Описание</label>
                        <textarea
                            id="template-details-description"
                            rows={4}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </div>

                    <div className={styles.row}>
                        <label htmlFor="template-details-note">Заметка тренера</label>
                        <textarea
                            id="template-details-note"
                            rows={4}
                            value={trainerNote}
                            onChange={(event) => setTrainerNote(event.target.value)}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-primary"
                            onClick={() => void handleSave()}
                            disabled={isSaving}
                        >
                            {isSaving ? "Сохраняем..." : "Сохранить"}
                        </button>

                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary"
                            onClick={() => navigate("/exercise-templates")}
                        >
                            Назад
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}