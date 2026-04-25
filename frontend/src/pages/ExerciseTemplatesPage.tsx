import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";

import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { CreateExerciseTemplateRequest as ApiCreateExerciseTemplateRequest } from "../features/exercise-template/model/exerciseTemplate.types";

import styles from "./ExerciseTemplatesPage.module.css";

type RepsMode = "NONE" | "EXACT" | "RANGE";

type ExerciseTemplateView = {
    id: number;
    trainerId: number;
    name: string;
    description?: string | null;
    sets?: number | null;
    repsMode: RepsMode;
    repsValue?: number | null;
    weight?: number | null;
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

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

function getRepsDisplay(item: ExerciseTemplateView): string {
    if (item.repsMode === "EXACT") {
        return item.repsDisplay || (item.repsValue != null ? String(item.repsValue) : "—");
    }

    if (item.repsMode === "RANGE") {
        return item.repsDisplay ||
            (item.repsFrom != null && item.repsTo != null ? `${item.repsFrom}–${item.repsTo}` : "—");
    }

    return "—";
}

function formatWeightDisplay(weight?: number | null): string {
    if (weight == null) {
        return "—";
    }

    return `${weight} кг`;
}

function formatTemplateSummary(item: ExerciseTemplateView): string {
    const parts: string[] = [];

    if (item.sets != null) parts.push(`${item.sets} подх.`);
    if (item.repsMode !== "NONE") parts.push(`${getRepsDisplay(item)} повт.`);
    if (item.weight != null) parts.push(`${item.weight} кг`);
    if (item.durationSeconds != null) parts.push(`${item.durationSeconds} сек.`);
    if (item.restSeconds != null) parts.push(`отдых ${item.restSeconds} сек.`);

    return parts.length > 0 ? parts.join(" • ") : "Параметры не заданы";
}

export default function ExerciseTemplatesPage() {
    const navigate = useNavigate();

    const [templates, setTemplates] = useState<ExerciseTemplateView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [includeArchived, setIncludeArchived] = useState(false);
    const [search, setSearch] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [weight, setWeight] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sets, setSets] = useState("");
    const [repsMode, setRepsMode] = useState<"" | RepsMode>("");
    const [repsValue, setRepsValue] = useState("");
    const [repsFrom, setRepsFrom] = useState("");
    const [repsTo, setRepsTo] = useState("");
    const [durationSeconds, setDurationSeconds] = useState("");
    const [restSeconds, setRestSeconds] = useState("");
    const [trainerNote, setTrainerNote] = useState("");

    const loadTemplates = useCallback(async () => {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = (await exerciseTemplateApi.getTemplates(includeArchived)) as unknown as ExerciseTemplateView[];
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

    const handleSelectRepsMode = (mode: RepsMode) => {
        setRepsMode(mode);

        if (mode === "EXACT") {
            setRepsFrom("");
            setRepsTo("");
            return;
        }

        if (mode === "RANGE") {
            setRepsValue("");
            return;
        }

        setRepsValue("");
        setRepsFrom("");
        setRepsTo("");
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            setErrorMessage("Укажи название шаблона");
            return;
        }

        if (repsMode === "EXACT" && !repsValue.trim()) {
            setErrorMessage("Укажи точное количество повторений");
            return;
        }

        if (repsMode === "RANGE") {
            if (!repsFrom.trim() || !repsTo.trim()) {
                setErrorMessage("Укажи нижнюю и верхнюю границы повторений");
                return;
            }

            if (Number(repsFrom) > Number(repsTo)) {
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
        setIsCreating(true);

        const payload = {
            name: name.trim(),
            weight: weight.trim() ? Number(weight.replace(",", ".")) : undefined,
            description: description.trim() || undefined,
            sets: sets.trim() ? Number(sets) : undefined,
            repsMode: repsMode || "NONE",
            repsValue: repsMode === "EXACT" && repsValue.trim() ? Number(repsValue) : undefined,
            repsFrom: repsMode === "RANGE" && repsFrom.trim() ? Number(repsFrom) : undefined,
            repsTo: repsMode === "RANGE" && repsTo.trim() ? Number(repsTo) : undefined,
            durationSeconds: durationSeconds.trim() ? Number(durationSeconds) : undefined,
            restSeconds: restSeconds.trim() ? Number(restSeconds) : undefined,
            trainerNote: trainerNote.trim() || undefined,
        } as unknown as ApiCreateExerciseTemplateRequest;

        try {
            const created = (await exerciseTemplateApi.createTemplate(payload)) as unknown as ExerciseTemplateView;
            setTemplates((prev) => [created, ...prev]);

            setName("");
            setDescription("");
            setSets("");
            setWeight("");
            setRepsMode("");
            setRepsValue("");
            setRepsFrom("");
            setRepsTo("");
            setDurationSeconds("");
            setRestSeconds("");
            setTrainerNote("");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось создать шаблон"));
        } finally {
            setIsCreating(false);
        }
    };

    const handleArchiveToggle = async (item: ExerciseTemplateView) => {
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
                            <div className={styles.row}>
                            <label htmlFor="template-weight">Вес, кг</label>
                            <input
                                id="template-weight"
                                inputMode="decimal"
                                value={weight}
                                onChange={(event) => setWeight(event.target.value)}
                                placeholder="Например, 12.5"
                            />
                        </div>
                        </div>

                        <div className={styles.row} style={{ gridColumn: "span 2" }}>
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
                                        repsMode === "EXACT"
                                            ? "dashboard-btn dashboard-btn-primary"
                                            : "dashboard-btn dashboard-btn-secondary"
                                    }
                                    onClick={() => handleSelectRepsMode("EXACT")}
                                >
                                    Точно
                                </button>

                                <button
                                    type="button"
                                    className={
                                        repsMode === "RANGE"
                                            ? "dashboard-btn dashboard-btn-primary"
                                            : "dashboard-btn dashboard-btn-secondary"
                                    }
                                    onClick={() => handleSelectRepsMode("RANGE")}
                                >
                                    Диапазон
                                </button>

                                <button
                                    type="button"
                                    className={
                                        repsMode === "NONE"
                                            ? "dashboard-btn dashboard-btn-primary"
                                            : "dashboard-btn dashboard-btn-secondary"
                                    }
                                    onClick={() => handleSelectRepsMode("NONE")}
                                >
                                    Не указывать
                                </button>
                            </div>

                            {repsMode === "EXACT" && (
                                <input
                                    id="template-reps-value"
                                    type="number"
                                    min="1"
                                    value={repsValue}
                                    onChange={(event) => setRepsValue(event.target.value)}
                                    placeholder="Например, 12"
                                />
                            )}

                            {repsMode === "RANGE" && (
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                        gap: 8,
                                    }}
                                >
                                    <input
                                        id="template-reps-from"
                                        type="number"
                                        min="1"
                                        value={repsFrom}
                                        onChange={(event) => setRepsFrom(event.target.value)}
                                        placeholder="От"
                                    />
                                    <input
                                        id="template-reps-to"
                                        type="number"
                                        min="1"
                                        value={repsTo}
                                        onChange={(event) => setRepsTo(event.target.value)}
                                        placeholder="До"
                                    />
                                </div>
                            )}

                            {!repsMode && (
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
                                        <strong>{getRepsDisplay(item)}</strong>
                                    </div>
                                    <div className={styles.detail}>
                                        <span>Вес</span>
                                        <strong>{formatWeightDisplay(item.weight)}</strong>
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