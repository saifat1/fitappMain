import type { ClientHistoryExercise } from "../model/clientHistory.types";
import {
    formatExerciseSummary,
    formatWeightDisplay,
} from "../lib/clientHistoryFormat";
import styles from "./ClientHistory.module.css";

type Props = {
    exercises: ClientHistoryExercise[];
};

export default function ClientHistoryExerciseList({ exercises }: Props) {
    if (exercises.length === 0) {
        return <div className={styles.empty}>Упражнений нет</div>;
    }

    return (
        <div className={styles.exerciseList}>
            {exercises.map((exercise) => (
                <div key={exercise.id} className={styles.exerciseCard}>
                    <div className={styles.exerciseTop}>
                        <div className={styles.exerciseTitleWrap}>
                            <div className={styles.exerciseTitle}>
                                {exercise.orderNum != null
                                    ? `${exercise.orderNum}. ${exercise.title}`
                                    : exercise.title}
                            </div>

                            <div className={styles.exerciseSummary}>
                                {formatExerciseSummary(exercise)}
                            </div>
                        </div>

                        <span
                            className={`${styles.exerciseState} ${
                                exercise.isCompleted
                                    ? styles.exerciseStateDone
                                    : styles.exerciseStatePending
                            }`}
                        >
              {exercise.isCompleted ? "Выполнено" : "Не выполнено"}
            </span>
                    </div>

                    <div className={styles.exerciseDetails}>
                        <div>Повторы: {exercise.repsMode !== "NONE" ? exercise.repsDisplay : "—"}</div>
                        <div>Вес: {formatWeightDisplay(exercise.weight)}</div>
                        <div>
                            Длительность:{" "}
                            {exercise.durationSeconds != null ? `${exercise.durationSeconds} сек` : "—"}
                        </div>
                        <div>
                            Отдых: {exercise.restSeconds != null ? `${exercise.restSeconds} сек` : "—"}
                        </div>

                        {exercise.description && (
                            <div>
                                <span className={styles.detailStrong}>Описание:</span> {exercise.description}
                            </div>
                        )}

                        {exercise.trainerNote && (
                            <div>
                                <span className={styles.detailStrong}>Заметка тренера:</span>{" "}
                                {exercise.trainerNote}
                            </div>
                        )}

                        {exercise.clientNote && (
                            <div>
                                <span className={styles.detailStrong}>Заметка клиента:</span>{" "}
                                {exercise.clientNote}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}