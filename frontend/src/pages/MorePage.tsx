import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/model/AuthContext";

export default function MorePage() {
    const { currentUser } = useAuth();
    const isTrainer = currentUser?.role === "TRAINER";

    return (
        <div className="entity-page-compact">
            <section className="entity-header-bar">
                <div className="entity-header-main">
                    <h1 className="entity-header-title">Ещё</h1>
                </div>
            </section>

            <section className="entity-panel-compact">
                <div className="exercise-compact-list">
                    {isTrainer && (
                        <article className="exercise-compact-card is-expanded">
                            <div className="exercise-compact-row">
                                <div className="exercise-compact-order">#</div>

                                <div className="exercise-compact-main">
                                    <div className="exercise-compact-top">
                                        <div className="exercise-compact-title-block">
                                            <div className="exercise-compact-title">Шаблоны упражнений</div>
                                            <div className="exercise-compact-summary">
                                                Типовые упражнения для быстрого добавления в тренировку
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="exercise-compact-actions">
                                    <Link
                                        to="/exercise-templates"
                                        className="dashboard-btn dashboard-btn-secondary"
                                    >
                                        Открыть
                                    </Link>
                                </div>
                            </div>
                        </article>
                    )}
                </div>
            </section>
        </div>
    );
}