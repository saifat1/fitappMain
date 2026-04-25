import type { ExerciseTemplateResponse } from "../model/exerciseTemplate.types";
import styles from "./TrainingTemplatePreview.module.css";

type Props = {
    template: ExerciseTemplateResponse;
};

function formatWeightDisplay(weight?: number | null): string {
    if (weight == null) {
        return "—";
    }

    return `${weight} кг`;
}

export default function TrainingTemplatePreview({ template }: Props) {
    return (
        <div className={styles.root}>
            <div className={styles.top}>
                <div className={styles.titleWrap}>
                    <div className={styles.title}>{template.name}</div>

                    <div className={styles.chips}>
                        {template.sets != null && (
                            <span className={styles.chip}>{template.sets} подх.</span>
                        )}

                        {template.repsMode !== "NONE" && template.repsDisplay && (
                            <span className={styles.chip}>{template.repsDisplay} повт.</span>
                        )}

                        {template.weight != null && (
                            <span className={styles.chip}>{template.weight} кг</span>
                        )}

                        {template.durationSeconds != null && (
                            <span className={styles.chip}>{template.durationSeconds} сек.</span>
                        )}

                        {template.restSeconds != null && (
                            <span className={styles.chip}>
                отдых {template.restSeconds} сек.
              </span>
                        )}
                    </div>
                </div>

                {(template.description || template.trainerNote) && (
                    <div className={styles.textList}>
                        {template.description && (
                            <div className={styles.textItem}>
                                <div className={styles.textLabel}>Описание</div>
                                <div className={styles.textValue}>{template.description}</div>
                            </div>
                        )}

                        {template.trainerNote && (
                            <div className={styles.textItem}>
                                <div className={styles.textLabel}>Заметка тренера</div>
                                <div className={styles.textValue}>{template.trainerNote}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <div className={styles.statLabel}>Подходы</div>
                    <strong className={styles.statValue}>{template.sets ?? "—"}</strong>
                </div>

                <div className={styles.stat}>
                    <div className={styles.statLabel}>Повторы</div>
                    <strong className={styles.statValue}>
                        {template.repsMode !== "NONE" ? template.repsDisplay : "—"}
                    </strong>
                </div>

                <div className={styles.stat}>
                    <div className={styles.statLabel}>Вес</div>
                    <strong className={styles.statValue}>
                        {formatWeightDisplay(template.weight)}
                    </strong>
                </div>

                <div className={styles.stat}>
                    <div className={styles.statLabel}>Длительность</div>
                    <strong className={styles.statValue}>
                        {template.durationSeconds != null
                            ? `${template.durationSeconds} сек`
                            : "—"}
                    </strong>
                </div>

                <div className={styles.stat}>
                    <div className={styles.statLabel}>Отдых</div>
                    <strong className={styles.statValue}>
                        {template.restSeconds != null ? `${template.restSeconds} сек` : "—"}
                    </strong>
                </div>
            </div>
        </div>
    );
}