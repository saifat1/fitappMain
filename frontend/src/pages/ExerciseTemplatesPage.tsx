import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";

import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    CreateExerciseTemplateRequest,
    ExerciseTemplateResponse,
} from "../features/exercise-template/model/exerciseTemplate.types";

import styles from "./ExerciseTemplatesPage.module.css";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function formatTemplateSummary(item: ExerciseTemplateResponse): string {
    const parts: string[] = [];

    if (item.sets != null) parts.push(`${item.sets} подх.`);
    if (item.reps != null) parts.push(`${item.reps} повт.`);
    if (item.durationSeconds != null) parts.push(`${item.durationSeconds} сек.`);
    if (item.restSeconds != null) parts.push(`отдых ${item.restSeconds} сек.`);

    return parts.length > 0 ? parts.join(" • ") : "Параметры не заданы";
}

export default function ExerciseTemplatesPage() {
    const navigate = useNavigate();

    const [templates, setTemplates] = useState<ExerciseTemplateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [includeArchived, setIncludeArchived] = useState(false);
    const [search, setSearch] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sets, setSets] = useState("");
    const [reps, setReps] = useState("");
    const [durationSeconds, setDurationSeconds] = useState("");
    const [restSeconds, setRestSeconds] = useState("");
    const [trainerNote, setTrainerNote] = useState("");

    const loadTemplates = useCallback(async () => {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await exerciseTemplateApi.getTemplates(includeArchived);
            setTemplates(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить шаблоны упражнений"));
        } finally {
            setIsLoading(false);
        }
    }, [includeArchived]);

    useEffect(() => {
        void loadTemplates();
    }, [loadTemplates]);

    const filteredTemplates = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) {
            return templates;
        }

        return templates.filter((item) => {
            const haystack = [item.name, item.description ?? "", item.trainerNote ?? ""]
                .join(" ")
                .toLowerCase();

            return haystack.includes(normalized);
        });
    }, [templates, search]);

    const handleCreate = async () => {
        if (!name.trim()) {
            setErrorMessage("Укажи название шаблона");
            return;
        }

        setErrorMessage("");
        setIsCreating(true);

        const payload: CreateExerciseTemplateRequest = {
            name: name.trim(),
            description: description.trim() || undefined,
            sets: sets.trim() ? Number(sets) : undefined,
            reps: reps.trim() ? Number(reps) : undefined,
            durationSeconds: durationSeconds.trim() ? Number(durationSeconds) : undefined,
            restSeconds: restSeconds.trim() ? Number(restSeconds) : undefined,
            trainerNote: trainerNote.trim() || undefined,
        };

        try {
            const created = await exerciseTemplateApi.createTemplate(payload);
            setTemplates((prev) => [created, ...prev]);

            setName("");
            setDescription("");
            setSets("");
            setReps("");
            setDurationSeconds("");
            setRestSeconds("");
            setTrainerNote("");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось создать шаблон"));
        } finally {
            setIsCreating(false);
        }
    };

    const handleArchiveToggle = async (item: ExerciseTemplateResponse) => {
        setErrorMessage("");

        try {
            if (item.isArchived) {
                await exerciseTemplateApi.restoreTemplate(item.id);
            } else {
                await exerciseTemplateApi.archiveTemplate(item.id);
            }

            setTemplates((prev) =>
                prev.map((current) =>
                    current.id === item.id
                        ? { ...current, isArchived: !current.isArchived }
                        : current
                )
            );
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось изменить статус шаблона"));
        }
    };

    return (
        <div className={styles.page}>
            <section className={styles.header}>
                <div className={styles.headerMain}>
                    <h1 className={styles.title}>Шаблоны упражнений</h1>
                    <p className={styles.subtitle}>
                        Типовые упражнения для быстрого добавления в тренировку
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary"
                        onClick={() => navigate("/me")}
                    >
                        Назад
                    </button>
                </div>
            </section>

            {errorMessage && <div className={styles.error}>{errorMessage}</div>}

            <section className={styles.panel}>
                <div className={styles.panelHead}>
                    <div>
                        <h2 className={styles.panelTitle}>Новый шаблон</h2>
                        <div className={styles.panelMeta}>Создай заготовку упражнения один раз</div>
                    </div>
                </div>

                <div className={styles.form}>
                    <div className={styles.grid}>
                        <div className={styles.row}>
                            <label htmlFor="template-name">Название</label>
                            <input
                                id="template-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Например, Присед"
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-sets">Подходы</label>
                            <input
                                id="template-sets"
                                type="number"
                                min="0"
                                value={sets}
                                onChange={(event) => setSets(event.target.value)}
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-reps">Повторы</label>
                            <input
                                id="template-reps"
                                type="number"
                                min="0"
                                value={reps}
                                onChange={(event) => setReps(event.target.value)}
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-duration">Длительность, сек</label>
                            <input
                                id="template-duration"
                                type="number"
                                min="0"
                                value={durationSeconds}
                                onChange={(event) => setDurationSeconds(event.target.value)}
                            />
                        </div>

                        <div className={styles.row}>
                            <label htmlFor="template-rest">Отдых, сек</label>
                            <input
                                id="template-rest"
                                type="number"
                                min="0"
                                value={restSeconds}
                                onChange={(event) => setRestSeconds(event.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <label htmlFor="template-description">Описание</label>
                        <textarea
                            id="template-description"
                            rows={3}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </div>

                    <div className={styles.row}>
                        <label htmlFor="template-note">Заметка тренера</label>
                        <textarea
                            id="template-note"
                            rows={3}
                            value={trainerNote}
                            onChange={(event) => setTrainerNote(event.target.value)}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-primary"
                            onClick={() => void handleCreate()}
                            disabled={isCreating}
                        >
                            {isCreating ? "Сохраняем..." : "Создать шаблон"}
                        </button>
                    </div>
                </div>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHead}>
                    <div>
                        <h2 className={styles.panelTitle}>Список шаблонов</h2>
                        <div className={styles.panelMeta}>
                            {templates.length} всего • {filteredTemplates.length} в текущем списке
                        </div>
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <div className={`${styles.row} ${styles.searchWrap}`}>
                        <label htmlFor="template-search">Поиск</label>
                        <input
                            id="template-search"
                            className={styles.searchInput}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Название, описание, заметка"
                        />
                    </div>

                    <div className={styles.toggleWrap}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={includeArchived}
                                onChange={(event) => setIncludeArchived(event.target.checked)}
                            />
                            <span className={styles.toggleText}>Показать архив</span>
                        </label>
                    </div>
                </div>

                {isLoading ? (
                    <div className={styles.empty}>Загрузка...</div>
                ) : filteredTemplates.length === 0 ? (
                    <div className={styles.empty}>Шаблонов пока нет</div>
                ) : (
                    <div className={styles.list}>
                        {filteredTemplates.map((item) => (
                            <article key={item.id} className={styles.card}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardMain}>
                                        <h3 className={styles.cardTitle}>{item.name}</h3>
                                        <div className={styles.cardSummary}>{formatTemplateSummary(item)}</div>
                                        {item.description && (
                                            <div className={styles.cardDescription}>{item.description}</div>
                                        )}
                                    </div>

                                    <div className={styles.badges}>
                    <span
                        className={`${styles.badge} ${
                            item.isArchived ? styles.badgeArchived : styles.badgeActive
                        }`}
                    >
                      {item.isArchived ? "Архив" : "Активен"}
                    </span>
                                    </div>
                                </div>

                                <div className={styles.detailGrid}>
                                    <div className={styles.detail}>
                                        <span>Подходы</span>
                                        <strong>{item.sets ?? "—"}</strong>
                                    </div>
                                    <div className={styles.detail}>
                                        <span>Повторы</span>
                                        <strong>{item.reps ?? "—"}</strong>
                                    </div>
                                    <div className={styles.detail}>
                                        <span>Длительность</span>
                                        <strong>
                                            {item.durationSeconds != null ? `${item.durationSeconds} сек` : "—"}
                                        </strong>
                                    </div>
                                    <div className={styles.detail}>
                                        <span>Отдых</span>
                                        <strong>{item.restSeconds != null ? `${item.restSeconds} сек` : "—"}</strong>
                                    </div>
                                </div>

                                <div className={styles.noteBox}>
                                    <strong>Заметка тренера:</strong> {item.trainerNote || "Нет заметки"}
                                </div>

                                <div className={styles.cardActions}>
                                    <button
                                        type="button"
                                        className="dashboard-btn dashboard-btn-secondary"
                                        onClick={() => navigate(`/exercise-templates/${item.id}`)}
                                    >
                                        Редактировать
                                    </button>

                                    <button
                                        type="button"
                                        className="dashboard-btn dashboard-btn-secondary"
                                        onClick={() => void handleArchiveToggle(item)}
                                    >
                                        {item.isArchived ? "Восстановить" : "В архив"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}