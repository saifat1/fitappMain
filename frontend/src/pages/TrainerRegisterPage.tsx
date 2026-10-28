import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import FbTextField from "../shared/ui/FbTextField";
import FbPasswordField from "../shared/ui/FbPasswordField";
import { useAuth } from "../features/auth/model/AuthContext";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import { signupSource } from "../shared/lib/signupSource";
import { isClientDevice, setClientDevice } from "../shared/lib/clientDevice";

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
    // FIT-83: a client device doesn't get the trainer registration unless the person says they are a trainer.
    const [clientDevice, setClientDeviceState] = useState(isClientDevice);

    if (!isInitializing && isAuthenticated) {
        return <Navigate to="/me" replace />;
    }

    if (clientDevice) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <h1 className="fb-topbar__title">Регистрация</h1>
                </header>
                <div className="fb-body">
                    <div className="fb-confirm">
                        <h2 className="fb-confirm__title">Регистрация — только для тренеров</h2>
                        <p className="fb-confirm__text">
                            Вы уже входили сюда как клиент. Ваш аккаунт создаёт тренер — войдите с логином и паролем,
                            которые он вам дал, или попросите у него ссылку для нового пароля.
                        </p>
                    </div>
                    <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={() => navigate("/login", { replace: true })}>
                        Войти
                    </button>
                    <button
                        type="button"
                        className="fb-link fb-link--muted"
                        onClick={() => {
                            setClientDevice(false);
                            setClientDeviceState(false);
                        }}
                    >
                        Я тренер — зарегистрироваться
                    </button>
                </div>
            </div>
        );
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
                source: signupSource(),
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
        <div className="fb-screen">
            <header className="fb-topbar">
                <button
                    type="button"
                    className="fb-topbar__back"
                    aria-label="Назад"
                    onClick={() => navigate("/welcome")}
                >
                    ‹
                </button>
                <h1 className="fb-topbar__title">Регистрация тренера</h1>
            </header>

            <form className="fb-body" onSubmit={handleSubmit} autoComplete="off">
                <FbTextField
                    id="trainer-register-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    required
                />

                <FbTextField
                    id="trainer-register-first-name"
                    label="Имя"
                    value={firstName}
                    onChange={setFirstName}
                    autoComplete="given-name"
                    required
                />

                <FbTextField
                    id="trainer-register-last-name"
                    label="Фамилия"
                    value={lastName}
                    onChange={setLastName}
                    autoComplete="family-name"
                    required
                />

                <FbPasswordField
                    id="trainer-register-password"
                    label="Пароль"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    required
                />

                <FbPasswordField
                    id="trainer-register-confirm-password"
                    label="Подтверждение пароля"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    error={errorMessage || undefined}
                    autoComplete="new-password"
                    required
                />

                <button
                    type="submit"
                    className="fb-btn fb-btn--primary fb-form-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Регистрируем…" : "Зарегистрироваться"}
                </button>

                <button type="button" className="fb-link" onClick={() => navigate("/login")}>
                    Уже есть аккаунт? Войти
                </button>
            </form>
        </div>
    );
}
