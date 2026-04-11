import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/model/AuthContext";

export default function MePage() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-empty">
                    <div className="dashboard-empty-title">Пользователь не загружен</div>
                    <div className="dashboard-empty-text">
                        Попробуй обновить страницу или войти заново.
                    </div>
                </div>
            </div>
        );
    }

    const isTrainer = currentUser.role === "TRAINER";
    const fullName =
        [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
        "Пользователь";

    const initials =
        `${currentUser.firstName?.[0] ?? ""}${currentUser.lastName?.[0] ?? ""}`.trim() ||
        currentUser.email?.[0]?.toUpperCase() ||
        "U";

    return (
        <div className="dashboard-page">
            <section className="dashboard-hero">
                <div className="dashboard-hero-main">
                    <div className="dashboard-kicker">Рабочее пространство</div>
                    <h1 className="dashboard-title">Добро пожаловать, {fullName}</h1>
                    <p className="dashboard-subtitle">
                        После входа ты сразу видишь основные действия и быстрые переходы по
                        ключевым сценариям приложения.
                    </p>

                    <div className="dashboard-hero-actions">
                        <Link to="/trainings" className="dashboard-btn dashboard-btn-primary">
                            Открыть тренировки
                        </Link>

                        {isTrainer ? (
                            <Link
                                to="/trainer/invites"
                                className="dashboard-btn dashboard-btn-secondary"
                            >
                                Пригласить клиента
                            </Link>
                        ) : (
                            <Link
                                to="/reschedule-requests"
                                className="dashboard-btn dashboard-btn-secondary"
                            >
                                Мои переносы
                            </Link>
                        )}
                    </div>
                </div>

                <div className="dashboard-profile-card">
                    <div className="dashboard-profile-top">
                        <div className="dashboard-avatar">{initials.toUpperCase()}</div>

                        <div>
                            <div className="dashboard-profile-name">{fullName}</div>
                            <div className="dashboard-profile-role">{currentUser.role}</div>
                        </div>
                    </div>

                    <div className="dashboard-profile-grid">
                        <div className="dashboard-profile-item">
                            <span>Email</span>
                            <strong>{currentUser.email}</strong>
                        </div>

                        <div className="dashboard-profile-item">
                            <span>Роль</span>
                            <strong>{isTrainer ? "Тренер" : "Клиент"}</strong>
                        </div>

                        <div className="dashboard-profile-item">
                            <span>ID</span>
                            <strong>{currentUser.id}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className="dashboard-stats">
                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-label">Основной сценарий</div>
                    <div className="dashboard-stat-value">
                        {isTrainer ? "Управление тренировками" : "Просмотр своих тренировок"}
                    </div>
                    <div className="dashboard-stat-note">
                        Быстрый доступ к расписанию и деталям занятий
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-label">Переносы</div>
                    <div className="dashboard-stat-value">Запросы и статусы</div>
                    <div className="dashboard-stat-note">
                        Отдельный раздел для согласования изменений
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="dashboard-stat-label">Профиль</div>
                    <div className="dashboard-stat-value">
                        {isTrainer ? "Тренерский кабинет" : "Кабинет клиента"}
                    </div>
                    <div className="dashboard-stat-note">
                        Интерфейс можно дальше развивать без смены маршрута
                    </div>
                </div>
            </section>

            <section className="dashboard-grid">
                <div className="dashboard-panel dashboard-panel-wide">
                    <div className="dashboard-panel-header">
                        <div>
                            <div className="dashboard-panel-kicker">Быстрые действия</div>
                            <h2 className="dashboard-panel-title">С чего начать</h2>
                        </div>
                    </div>

                    <div className="dashboard-action-grid">
                        <Link to="/trainings" className="dashboard-action-card">
                            <div className="dashboard-action-title">Тренировки</div>
                            <div className="dashboard-action-text">
                                Просмотр списка тренировок и переход к деталям занятия.
                            </div>
                        </Link>

                        <Link to="/reschedule-requests" className="dashboard-action-card">
                            <div className="dashboard-action-title">Переносы</div>
                            <div className="dashboard-action-text">
                                Работа с запросами на перенос и контроль статусов.
                            </div>
                        </Link>

                        {isTrainer && (
                            <>
                                <Link to="/trainer/clients" className="dashboard-action-card">
                                    <div className="dashboard-action-title">Клиенты</div>
                                    <div className="dashboard-action-text">
                                        Список клиентов, закреплённых за тренером.
                                    </div>
                                </Link>

                                <Link to="/trainer/invites" className="dashboard-action-card">
                                    <div className="dashboard-action-title">Приглашения</div>
                                    <div className="dashboard-action-text">
                                        Создание и контроль инвайтов для новых клиентов.
                                    </div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="dashboard-panel">
                    <div className="dashboard-panel-header">
                        <div>
                            <div className="dashboard-panel-kicker">Статус</div>
                            <h2 className="dashboard-panel-title">Текущий профиль</h2>
                        </div>
                    </div>

                    <div className="dashboard-info-list">
                        <div className="dashboard-info-row">
                            <span>Имя</span>
                            <strong>{currentUser.firstName || "—"}</strong>
                        </div>
                        <div className="dashboard-info-row">
                            <span>Фамилия</span>
                            <strong>{currentUser.lastName || "—"}</strong>
                        </div>
                        <div className="dashboard-info-row">
                            <span>Email</span>
                            <strong>{currentUser.email}</strong>
                        </div>
                        <div className="dashboard-info-row">
                            <span>Тип аккаунта</span>
                            <strong>{isTrainer ? "Тренер" : "Клиент"}</strong>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}