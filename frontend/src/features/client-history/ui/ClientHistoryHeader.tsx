import type { ClientHistoryClient } from "../model/clientHistory.types";
import { formatClientDisplayName } from "../lib/clientHistoryFormat";
import styles from "./ClientHistory.module.css";

type Props = {
    client: ClientHistoryClient;
    onBack: () => void;
    onOpenClient: () => void;
    onCreateTraining: () => void;
};

export default function ClientHistoryHeader({
                                                client,
                                                onBack,
                                                onOpenClient,
                                                onCreateTraining,
                                            }: Props) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <p className="dashboard-kicker">Клиент</p>
                <h1 className="dashboard-title">{formatClientDisplayName(client)}</h1>
                <p className="dashboard-subtitle">
                    История тренировок, фильтры и быстрый переход в конкретную тренировку.
                </p>
                <div className={styles.heroEmail}>{client.email}</div>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary"
                    onClick={onBack}
                >
                    Назад
                </button>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-secondary"
                    onClick={onOpenClient}
                >
                    Карточка клиента
                </button>

                <button
                    type="button"
                    className="dashboard-btn dashboard-btn-primary"
                    onClick={onCreateTraining}
                >
                    Новая тренировка
                </button>
            </div>
        </section>
    );
}