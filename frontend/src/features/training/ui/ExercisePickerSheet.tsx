import { useEffect, useMemo, useState } from "react";
import ExerciseDetailForm from "./ExerciseDetailForm";
import { exerciseTemplateApi } from "../../../shared/api/exerciseTemplateApi";
import { MUSCLE_GROUPS, muscleGroupLabel } from "../../exercise-template/lib/muscleGroup";
import { summaryFromParts, type DraftExercise } from "../model/trainingDraft";
import type {
    ExerciseTemplateResponse,
    MuscleGroup,
} from "../../exercise-template/model/exerciseTemplate.types";

type Tab = "template" | "custom";
type CategoryFilter = "ALL" | MuscleGroup;

type Props = {
    onPick: (draft: DraftExercise) => void;
    onClose: () => void;
};

export default function ExercisePickerSheet({ onPick, onClose }: Props) {
    const [tab, setTab] = useState<Tab>("template");
    const [templates, setTemplates] = useState<ExerciseTemplateResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState<CategoryFilter>("ALL");
    const [selected, setSelected] = useState<ExerciseTemplateResponse | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await exerciseTemplateApi.getTemplates(false);
                if (active) setTemplates(data);
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const filtered = useMemo(
        () => (category === "ALL" ? templates : templates.filter((t) => t.muscleGroup === category)),
        [templates, category]
    );

    const handleAdd = (draft: DraftExercise) => {
        onPick(draft);
        onClose();
    };

    const switchTab = (next: Tab) => {
        setTab(next);
        setSelected(null);
    };

    return (
        <>
            <button type="button" className="fb-sheet-backdrop" aria-label="Закрыть" onClick={onClose} />
            <div className="fb-sheet fb-sheet--tall" role="dialog" aria-label="Упражнение">
                <div className="fb-segment">
                    <button
                        type="button"
                        className={`fb-segment__item ${tab === "template" ? "fb-segment__item--active" : ""}`}
                        onClick={() => switchTab("template")}
                    >
                        Из шаблона
                    </button>
                    <button
                        type="button"
                        className={`fb-segment__item ${tab === "custom" ? "fb-segment__item--active" : ""}`}
                        onClick={() => switchTab("custom")}
                    >
                        Новое
                    </button>
                </div>

                {tab === "custom" ? (
                    <ExerciseDetailForm onAdd={handleAdd} />
                ) : selected ? (
                    <ExerciseDetailForm
                        template={selected}
                        onAdd={handleAdd}
                        onBack={() => setSelected(null)}
                    />
                ) : (
                    <>
                        <div className="fb-chips">
                            <button
                                type="button"
                                className={`fb-chip ${category === "ALL" ? "fb-chip--active" : ""}`}
                                onClick={() => setCategory("ALL")}
                            >
                                Все
                            </button>
                            {MUSCLE_GROUPS.map((g) => (
                                <button
                                    key={g}
                                    type="button"
                                    className={`fb-chip ${category === g ? "fb-chip--active" : ""}`}
                                    onClick={() => setCategory(g)}
                                >
                                    {muscleGroupLabel(g)}
                                </button>
                            ))}
                        </div>

                        <div className="fb-sheet__scroll">
                            {isLoading ? (
                                <div className="fb-empty">Загрузка…</div>
                            ) : filtered.length === 0 ? (
                                <div className="fb-empty">Шаблонов нет</div>
                            ) : (
                                <div className="fb-list">
                                    {filtered.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            className="fb-row fb-row--button"
                                            onClick={() => setSelected(t)}
                                        >
                                            <span className="fb-row__main">
                                                <span className="fb-row__title">{t.name}</span>
                                                <span className="fb-row__sub">
                                                    {summaryFromParts({
                                                        repsDisplay: t.repsMode !== "NONE" ? t.repsDisplay : null,
                                                        durationSeconds: t.durationSeconds,
                                                        weight: t.weight,
                                                        sets: t.sets,
                                                    })}
                                                </span>
                                            </span>
                                            <span className="fb-row__chevron">›</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
