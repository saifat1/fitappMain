import styles from "./ClientHistory.module.css";

type Props = {
    total: number;
    completed: number;
    cancelled: number;
    latestTrainingLabel: string;
    completionRate: number;
};

export default function ClientHistoryStats({
                                               total,
                                               completed,
                                               cancelled,
                                               latestTrainingLabel,
                                               completionRate,
                                           }: Props) {
    return (
        <section className={styles.statsGrid}>
            <article className={styles.statCard}>
                <h3 className={styles.statLabel}>Всего тренировок</h3>
                <p className={styles.statValue}>{total}</p>
            </article>

            <article className={styles.statCard}>
                <h3 className={styles.statLabel}>Завершено</h3>
                <p className={styles.statValue}>{completed}</p>
            </article>

            <article className={styles.statCard}>
                <h3 className={styles.statLabel}>Отменено</h3>
                <p className={styles.statValue}>{cancelled}</p>
            </article>

            <article className={styles.statCard}>
                <h3 className={styles.statLabel}>Последняя тренировка</h3>
                <p className={styles.statValueCompact}>{latestTrainingLabel}</p>
            </article>

            <article className={styles.statCard}>
                <h3 className={styles.statLabel}>Выполнение упражнений</h3>
                <p className={styles.statValue}>{completionRate}%</p>
            </article>
        </section>
    );
}