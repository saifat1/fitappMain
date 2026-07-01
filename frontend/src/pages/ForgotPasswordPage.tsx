import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FbTextField from "../shared/ui/FbTextField";
import { authApi } from "../shared/api/authApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            setErrorMessage("Укажите электронную почту");
            return;
        }
        setErrorMessage("");
        setIsSubmitting(true);
        try {
            await authApi.forgotPassword(email.trim());
            setSent(true);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось отправить ссылку"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (sent) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate("/login")}>‹</button>
                    <h1 className="fb-topbar__title">Восстановление пароля</h1>
                </header>
                <div className="fb-body">
                    <div className="fb-confirm">
                        <svg className="fb-confirm__icon" viewBox="0 0 96 96" fill="none" aria-hidden="true">
                            <rect x="8" y="8" width="80" height="80" rx="20" fill="#34a853" />
                            <path d="M30 50l12 12 24-26" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="fb-confirm__title">Проверьте почту</h2>
                        <p className="fb-confirm__text">
                            Если <strong>{email.trim()}</strong> зарегистрирован, мы отправили письмо со ссылкой
                            для создания нового пароля. Перейдите по ссылке из письма.
                        </p>
                    </div>
                    <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={() => navigate("/login")}>
                        Вернуться ко входу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate("/login")}>‹</button>
                <h1 className="fb-topbar__title">Восстановление пароля</h1>
            </header>
            <div className="fb-body">
                <FbTextField
                    id="fp-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    error={errorMessage || undefined}
                    autoComplete="email"
                />
                <div className="fb-field-hint">
                    Введите почту, которую использовали при регистрации. Мы отправим ссылку для создания нового пароля.
                </div>

                <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Отправляем…" : "Отправить ссылку"}
                </button>
            </div>
        </div>
    );
}
