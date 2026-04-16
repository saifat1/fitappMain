import type { ExerciseTemplateResponse } from "../model/exerciseTemplate.types";
import styles from "./TrainingTemplatePreview.module.css";

type Props = {
    template: ExerciseTemplateResponse;
};

export default function TrainingTemplatePreview({ template }: Props) {
    return (
        <div className={styles.root}>
            <div className={styles.top}>
                <div className={styles.titleWrap}>
                    <div className={styles.title}>{template.name}</div>

                    {(template.description || template.trainerNote) && (
                        <div className={styles.textList}>
                            {template.description && (
                                <div className={styles.textItem}>
                                    <span className={styles.textLabel}>Описание</span>
                                    <strong className={styles.textValue}>{template.description}</strong>
                                </div>
                            )}

                            {template.trainerNote && (
                                <div className={styles.textItem}>
                                    <span className={styles.textLabel}>Заметка тренера</span>
                                    <strong className={styles.textValue}>{template.trainerNote}</strong>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.chips}>
                    {template.sets != null && (
                        <span className={styles.chip}>{template.sets} подх.</span>
                    )}

                    {template.reps != null && (
                        <span className={styles.chip}>{template.reps} повт.</span>
                    )}

                    {template.durationSeconds != null && (
                        <span className={styles.chip}>{template.durationSeconds} сек.</span>
                    )}

                    {template.restSeconds != null && (
                        <span className={styles.chip}>отдых {template.restSeconds} сек.</span>
                    )}
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>Подходы</span>
                    <strong className={styles.statValue}>{template.sets ?? "—"}</strong>
                </div>

                <div className={styles.stat}>
                    <span className={styles.statLabel}>Повторы</span>
                    <strong className={styles.statValue}>{template.reps ?? "—"}</strong>
                </div>

                <div className={styles.stat}>
                    <span className={styles.statLabel}>Длительность</span>
                    <strong className={styles.statValue}>
                        {template.durationSeconds != null
                            ? `${template.durationSeconds} сек`
                            : "—"}
                    </strong>
                </div>

                <div className={styles.stat}>
                    <span className={styles.statLabel}>Отдых</span>
                    <strong className={styles.statValue}>
                        {template.restSeconds != null
                            ? `${template.restSeconds} сек`
                            : "—"}
                    </strong>
                </div>
            </div>
        </div>
    );
}