import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import MobileShell from "../widgets/MobileShell";
import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";
import { MUSCLE_GROUPS, muscleGroupLabel } from "../features/exercise-template/lib/muscleGroup";

import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    ExerciseTemplateResponse,
    MuscleGroup,
} from "../features/exercise-template/model/exerciseTemplate.types";

type CategoryFilter = "ALL" | MuscleGroup;

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function formatSummary(item: ExerciseTemplateResponse): string {
    const parts: string[] = [];

    if (item.repsMode !== "NONE" && item.repsDisplay && item.repsDisplay !== "—") {
        parts.push(`${item.repsDisplay} повт.`);
    }
    if (item.durationSeconds != null) parts.push(`${item.durationSeconds} сек`);
    if (item.weight != null) parts.push(`${item.weight} кг`);
    if (item.sets != null) parts.push(`${item.sets} подх.`);

    return parts.length > 0 ? parts.join(" · ") : "Параметры не заданы";
}

export default function ExerciseTemplatesPage() {
    const navigate = useNavigate();

    const [templates, setTemplates] = useState<ExerciseTemplateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [includeArchived, setIncludeArchived] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<CategoryFilter>("ALL");
    const [errorMessage, setErrorMessage] = useState("");

    const loadTemplates = useCallback(async () => {
        setErrorMessage("");
        setIsLoading(true);

        try {
            const data = await exerciseTemplateApi.getTemplates(includeArchived);
            setTemplates(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить упражнения"));
        } finally {
            setIsLoading(false);
        }
    }, [includeArchived]);

    useEffect(() => {
        void loadTemplates();
    }, [loadTemplates]);

    const filteredTemplates = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        return templates.filter((item) => {
            if (category !== "ALL" && item.muscleGroup !== category) {
                return false;
            }

            if (!normalized) {
                return true;
            }

            const haystack = [item.name, item.description ?? "", item.trainerNote ?? ""]
                .join(" ")
                .toLowerCase();

            return haystack.includes(normalized);
        });
    }, [templates, search, category]);

    return (
        <MobileShell
            title="Упражнения"
            right={
                <button
                    type="button"
                    className={`fb-chip ${includeArchived ? "fb-chip--active" : ""}`}
                    onClick={() => setIncludeArchived((prev) => !prev)}
                >
                    Архив
                </button>
            }
            fab={
                <button
                    type="button"
                    className="fb-fab"
                    aria-label="Новое упражнение"
                    onClick={() => navigate("/exercise-templates/new")}
                >
                    +
                </button>
            }
        >
            <div className="fb-chips">
                <button
                    type="button"
                    className={`fb-chip ${category === "ALL" ? "fb-chip--active" : ""}`}
                    onClick={() => setCategory("ALL")}
                >
                    Все
                </button>
                {MUSCLE_GROUPS.map((group) => (
                    <button
                        key={group}
                        type="button"
                        className={`fb-chip ${category === group ? "fb-chip--active" : ""}`}
                        onClick={() => setCategory(group)}
                    >
                        {muscleGroupLabel(group)}
                    </button>
                ))}
            </div>

            <div className="fb-search">
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Поиск упражнения"
                />
            </div>

            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            {isLoading ? (
                <div className="fb-empty">Загрузка…</div>
            ) : filteredTemplates.length === 0 ? (
                <div className="fb-empty">Упражнений пока нет</div>
            ) : (
                <div className="fb-list">
                    {filteredTemplates.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="fb-row fb-row--button"
                            onClick={() => navigate(`/exercise-templates/${item.id}`)}
                        >
                            <span className="fb-row__main">
                                <span className="fb-row__title">{item.name}</span>
                                <span className="fb-row__sub">{formatSummary(item)}</span>
                            </span>
                            {item.isArchived ? (
                                <span className="fb-pill fb-pill--muted">Архив</span>
                            ) : null}
                            <span className="fb-row__chevron">›</span>
                        </button>
                    ))}
                </div>
            )}
        </MobileShell>
    );
}
