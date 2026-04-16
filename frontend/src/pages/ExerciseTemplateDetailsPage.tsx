import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";

import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    ExerciseTemplateResponse,
    UpdateExerciseTemplateRequest,
} from "../features/exercise-template/model/exerciseTemplate.types";

import styles from "./ExerciseTemplatesPage.module.css";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
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
    const [reps, setReps] = useState("");
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
                setReps(data.reps != null ? String(data.reps) : "");
                setDurationSeconds(data.durationSeconds != null ? String(data.durationSeconds) : "");
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

        setErrorMessage("");
        setIsSaving(true);

        const payload: UpdateExerciseTemplateRequest = {
            name: name.trim(),
            description: description.trim() || undefined,
            sets: sets.trim() ? Number(sets) : undefined,
            reps: reps.trim() ? Number(reps) : undefined,
            durationSeconds: durationSeconds.trim() ? Number(durationSeconds) : undefined,
            restSeconds: restSeconds.trim() ? Number(restSeconds) : undefined,
            trainerNote: trainerNote.trim() || undefined,
        };

        try {
            const updated = await exerciseTemplateApi.updateTemplate(Number(templateId), payload);
            setTemplate(updated);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось сохранить шаблон"));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.page}>
                <section className={styles.panel}>
                    <div className={styles.empty}>Загрузка...</div>
                </section>
            </div>
        );
    }

    if (!template) {
        return (
            <div className={styles.page}>
                {errorMessage && <div className={styles.error}>{errorMessage}</div>}
                <section className={styles.panel}>
                    <div className={styles.empty}>Шаблон не найден</div>
                </section>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <section className={styles.header}>
                <div className={styles.headerMain}>
                    <h1 className={styles.title}>Шаблон упражнения</h1>
                    <div className={styles.statusRow}>
            <span
                className={`${styles.badge} ${
                    template.isArchived ? styles.badgeArchived : styles.badgeActive
                }`}
            >
              {template.isArchived ? "Архив" : "Активен"}
            </span>
                    </div>
                </div>

                <div className={styles.headerActions}>
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
                        <div className={styles.panelMeta}>Редактирование шаблона упражнения</div>
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
                                type="number"
                                min="0"
                                value={sets}
                                onChange={(event) => setSets(event.target.value)}
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-details-reps">Повторы</label>
                            <input
                                id="template-details-reps"
                                type="number"
                                min="0"
                                value={reps}
                                onChange={(event) => setReps(event.target.value)}
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-details-duration">Длительность, сек</label>
                            <input
                                id="template-details-duration"
                                type="number"
                                min="0"
                                value={durationSeconds}
                                onChange={(event) => setDurationSeconds(event.target.value)}
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-details-rest">Отдых, сек</label>
                            <input
                                id="template-details-rest"
                                type="number"
                                min="0"
                                value={restSeconds}
                                onChange={(event) => setRestSeconds(event.target.value)}
                            />
                        </div>
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