import type { ClientHistoryTraining } from "../model/clientHistory.types";
import ClientHistoryCard from "./ClientHistoryCard";
import styles from "./ClientHistory.module.css";

type Props = {
    trainings: ClientHistoryTraining[];
    expandedIds: number[];
    onToggleExpanded: (trainingId: number) => void;
    onOpenTraining: (trainingId: number) => void;
};

export default function ClientHistoryList({
                                              trainings,
                                              expandedIds,
                                              onToggleExpanded,
                                              onOpenTraining,
                                          }: Props) {
    return (
        <section className={styles.listCard}>
            <div className={styles.listHeader}>
                <div>
                    <h2 className={styles.listTitle}>История тренировок</h2>
                    <p className={styles.listMeta}>Найдено: {trainings.length}</p>
                </div>
            </div>

            {trainings.length === 0 ? (
                <div className={styles.empty}>По текущим фильтрам тренировки не найдены.</div>
            ) : (
                <div className={styles.list}>
                    {trainings.map((training) => (
                        <ClientHistoryCard
                            key={training.id}
                            training={training}
                            expanded={expandedIds.includes(training.id)}
                            onToggleExpanded={() => onToggleExpanded(training.id)}
                            onOpenTraining={() => onOpenTraining(training.id)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}