import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import PasswordInput from "../shared/ui/PasswordInput";
import { useAuth } from "../features/auth/model/AuthContext";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

export default function TrainerRegisterPage() {
    const { registerTrainer, isAuthenticated, isInitializing } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    if (!isInitializing && isAuthenticated) {
        return <Navigate to="/me" replace />;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Подтверждение пароля не совпадает");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await registerTrainer({
                email,
                firstName,
                lastName,
                password,
                confirmPassword,
            });

            navigate("/me", { replace: true });
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Ошибка регистрации");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-layout">
                <section className="login-hero">
                    <div className="login-hero-badge">Fit App</div>

                    <h1 className="login-hero-title">
                        Регистрация тренера в рабочем пространстве FitApp
                    </h1>

                    <p className="login-hero-text">
                        Создай аккаунт тренера, чтобы работать с клиентами, тренировками,
                        доступностью и отчётами.
                    </p>

                    <div className="login-hero-cards">
                        <div className="login-hero-card">
                            <div className="login-hero-card-title">Клиенты</div>
                            <div className="login-hero-card-text">
                                Ведение базы клиентов и истории тренировок.
                            </div>
                        </div>

                        <div className="login-hero-card">
                            <div className="login-hero-card-title">Расписание</div>
                            <div className="login-hero-card-text">
                                Календарь, доступность и запросы на запись.
                            </div>
                        </div>

                        <div className="login-hero-card">
                            <div className="login-hero-card-title">Рабочий контур</div>
                            <div className="login-hero-card-text">
                                Всё основное в одном интерфейсе без лишнего шума.
                            </div>
                        </div>
                    </div>
                </section>

                <section className="login-form-section">
                    <div className="login-card">
                        <div className="login-card-header">
                            <div className="login-card-kicker">Регистрация</div>
                            <h2 className="login-card-title">Новый тренер</h2>
                            <p className="login-card-description">
                                После регистрации вход выполнится автоматически.
                            </p>
                        </div>

                        <form className="form" onSubmit={handleSubmit} autoComplete="off">
                            <div className="form-row">
                                <label htmlFor="trainer-register-email">Email</label>
                                <input
                                    id="trainer-register-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="Введите email"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="trainer-register-first-name">Имя</label>
                                <input
                                    id="trainer-register-first-name"
                                    type="text"
                                    value={firstName}
                                    onChange={(event) => setFirstName(event.target.value)}
                                    placeholder="Введите имя"
                                    autoComplete="given-name"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="trainer-register-last-name">Фамилия</label>
                                <input
                                    id="trainer-register-last-name"
                                    type="text"
                                    value={lastName}
                                    onChange={(event) => setLastName(event.target.value)}
                                    placeholder="Введите фамилию"
                                    autoComplete="family-name"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="trainer-register-password">Пароль</label>
                                <PasswordInput
                                    id="trainer-register-password"
                                    value={password}
                                    onChange={setPassword}
                                    placeholder="Введите пароль"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <label htmlFor="trainer-register-confirm-password">
                                    Подтверждение пароля
                                </label>
                                <PasswordInput
                                    id="trainer-register-confirm-password"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    placeholder="Повтори пароль"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            {errorMessage && <div className="form-error">{errorMessage}</div>}

                            <button type="submit" className="dashboard-btn dashboard-btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? "Регистрируем..." : "Зарегистрироваться"}
                            </button>
                        </form>

                        <div className="login-help">
                            <div className="login-help-title">Уже есть аккаунт?</div>
                            <div className="login-help-text">
                                Вернись на страницу входа и авторизуйся под своим email.
                            </div>

                            <Link to="/login" className="login-secondary-link">
                                Перейти ко входу
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}