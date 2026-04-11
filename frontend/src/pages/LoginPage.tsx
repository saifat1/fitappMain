import { Link, Navigate } from "react-router-dom";
import LoginForm from "../features/auth/ui/LoginForm";
import { useAuth } from "../features/auth/model/AuthContext";

export default function LoginPage() {
    const { isAuthenticated, isInitializing } = useAuth();

    if (!isInitializing && isAuthenticated) {
        return <Navigate to="/me" replace />;
    }

    return (
        <div className="login-page">
            <div className="login-layout">
                <section className="login-hero">
                    <div className="login-hero-badge">Fit App</div>

                    <h1 className="login-hero-title">
                        Тренировки, клиенты и расписание — в одном рабочем пространстве
                    </h1>

                    <p className="login-hero-text">
                        Удобный вход для тренера и зарегистрированного клиента. Спокойный,
                        современный интерфейс с акцентом на скорость и понятность.
                    </p>

                    <div className="login-hero-cards">
                        <div className="login-hero-card">
                            <div className="login-hero-card-title">Быстрый старт</div>
                            <div className="login-hero-card-text">
                                Вход без перегрузки интерфейса и лишних действий.
                            </div>
                        </div>

                        <div className="login-hero-card">
                            <div className="login-hero-card-title">Рабочий ритм</div>
                            <div className="login-hero-card-text">
                                Управление тренировками, клиентами и запросами на перенос.
                            </div>
                        </div>

                        <div className="login-hero-card">
                            <div className="login-hero-card-title">Под mobile в будущем</div>
                            <div className="login-hero-card-text">
                                Компоновка уже подходит для дальнейшей адаптации под телефон.
                            </div>
                        </div>
                    </div>

                    <div className="login-hero-panel">
                        <div className="login-hero-panel-title">Для клиентов</div>
                        <div className="login-hero-panel-text">
                            Регистрация выполняется только по приглашению тренера.
                        </div>
                        <div className="login-hero-panel-note">
                            Если у тебя уже есть инвайт-ссылка, просто открой её в браузере.
                        </div>
                    </div>
                </section>

                <section className="login-form-section">
                    <div className="login-card">
                        <div className="login-card-header">
                            <div className="login-card-kicker">Вход</div>
                            <h2 className="login-card-title">Добро пожаловать</h2>
                            <p className="login-card-description">
                                Войди как тренер или как уже зарегистрированный клиент.
                            </p>
                        </div>

                        <LoginForm />

                        <div className="login-help">
                            <div className="login-help-title">Нет доступа?</div>
                            <div className="login-help-text">
                                Новый клиент может зарегистрироваться только по приглашению
                                тренера.
                            </div>

                            <Link to="/trainer/invites" className="login-secondary-link">
                                Где создаются инвайты
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}