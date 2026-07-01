import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import FbPasswordField from "../shared/ui/FbPasswordField";
import { authApi } from "../shared/api/authApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [done, setDone] = useState(false);

    const handleSubmit = async () => {
        if (!token) {
            setErrorMessage("Ссылка недействительна");
            return;
        }
        if (password.length < 6) {
            setErrorMessage("Пароль должен быть не короче 6 символов");
            return;
        }
        if (password !== confirm) {
            setErrorMessage("Пароли не совпадают");
            return;
        }
        setErrorMessage("");
        setIsSubmitting(true);
        try {
            await authApi.resetPassword(token, password);
            setDone(true);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось обновить пароль"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (done) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <h1 className="fb-topbar__title">Новый пароль</h1>
                </header>
                <div className="fb-body">
                    <div className="fb-confirm">
                        <svg className="fb-confirm__icon" viewBox="0 0 96 96" fill="none" aria-hidden="true">
                            <rect x="8" y="8" width="80" height="80" rx="20" fill="#34a853" />
                            <path d="M30 50l12 12 24-26" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="fb-confirm__title">Пароль обновлён</h2>
                        <p className="fb-confirm__text">Теперь войдите с новым паролем.</p>
                    </div>
                    <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={() => navigate("/login", { replace: true })}>
                        Войти
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <h1 className="fb-topbar__title">Новый пароль</h1>
            </header>
            <div className="fb-body">
                <FbPasswordField
                    id="rp-password"
                    label="Новый пароль"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                />
                <FbPasswordField
                    id="rp-confirm"
                    label="Повторите пароль"
                    value={confirm}
                    onChange={setConfirm}
                    error={errorMessage || undefined}
                    autoComplete="new-password"
                />

                <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Сохраняем…" : "Сохранить"}
                </button>
            </div>
        </div>
    );
}
