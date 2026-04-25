import type { ClientHistoryTraining } from "../model/clientHistory.types";
import {
    formatTrainingDateLabel,
    formatTrainingStatus,
    formatTrainingTimeRange,
    getCompletedExercisesCount,
    getCompletionRate,
    hasTrainingNotes,
} from "../lib/clientHistoryFormat";
import ClientHistoryExerciseList from "./ClientHistoryExerciseList";
import styles from "./ClientHistory.module.css";

type Props = {
    training: ClientHistoryTraining;
    expanded: boolean;
    onToggleExpanded: () => void;
    onOpenTraining: () => void;
};

function getStatusClass(status: ClientHistoryTraining["status"]): string {
    switch (status) {
        case "COMPLETED":
            return styles.statusCompleted;
        case "CANCELLED":
            return styles.statusCancelled;
        case "PLANNED":
        default:
            return styles.statusPlanned;
    }
}

export default function ClientHistoryCard({
                                              training,
                                              expanded,
                                              onToggleExpanded,
                                              onOpenTraining,
                                          }: Props) {
    const completedExercises = getCompletedExercisesCount(training);
    const completionRate = getCompletionRate(training);

    return (
        <article className={styles.trainingCard}>
            <div className={styles.trainingTop}>
                <div className={styles.trainingMain}>
                    <div className={styles.trainingTitle}>
                        {formatTrainingDateLabel(training.trainingDate)}
                    </div>

                    <div className={styles.trainingTime}>
                        {formatTrainingTimeRange(training.startTime, training.endTime)}
                    </div>

                    <div className={styles.badgeRow}>
            <span className={`${styles.statusBadge} ${getStatusClass(training.status)}`}>
              {formatTrainingStatus(training.status)}
            </span>

                        {hasTrainingNotes(training) && (
                            <span className={`${styles.statusBadge} ${styles.statusNotes}`}>
                Есть заметки
              </span>
                        )}
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary"
                        onClick={onOpenTraining}
                    >
                        Открыть
                    </button>

                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary"
                        onClick={onToggleExpanded}
                    >
                        {expanded ? "Свернуть" : "Развернуть"}
                    </button>
                </div>
            </div>

            <div className={styles.metricsRow}>
                <span>Упражнений: {training.exercises.length}</span>
                <span>
          Выполнено: {completedExercises} из {training.exercises.length}
        </span>
                <span>Процент выполнения: {completionRate}%</span>
            </div>

            {(training.trainerNote || training.clientNote) && (
                <div className={styles.noteList}>
                    {training.trainerNote && (
                        <div>
                            <span className={styles.detailStrong}>Заметка тренера:</span>{" "}
                            {training.trainerNote}
                        </div>
                    )}

                    {training.clientNote && (
                        <div>
                            <span className={styles.detailStrong}>Заметка клиента:</span>{" "}
                            {training.clientNote}
                        </div>
                    )}
                </div>
            )}

            {expanded && <ClientHistoryExerciseList exercises={training.exercises} />}
        </article>
    );
}