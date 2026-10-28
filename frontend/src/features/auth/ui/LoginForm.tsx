import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import FbTextField from "../../../shared/ui/FbTextField";
import FbPasswordField from "../../../shared/ui/FbPasswordField";
import { useAuth } from "../model/AuthContext";
import type { ApiErrorResponse } from "../model/auth.types";

export default function LoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();
    // FIT-83: after «Новый пароль» the login is the account whose password was changed, not the browser's saved one.
    const prefilledEmail = (useLocation().state as { email?: string } | null)?.email ?? "";

    const [email, setEmail] = useState(prefilledEmail);
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await login({ email, password });
            navigate("/me", { replace: true });
        } catch (error) {
            if (axios.isAxiosError<ApiErrorResponse>(error)) {
                setErrorMessage(error.response?.data?.message ?? "Ошибка входа");
            } else {
                setErrorMessage("Неизвестная ошибка");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="fb-body" onSubmit={handleSubmit}>
            <FbTextField
                id="login-email"
                label="Логин"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                required
            />

            <FbPasswordField
                id="login-password"
                label="Пароль"
                value={password}
                onChange={setPassword}
                error={errorMessage || undefined}
                autoComplete="current-password"
                required
            />

            <div className="fb-spacer" />

            <button
                type="submit"
                className="fb-btn fb-btn--primary"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Входим…" : "Войти"}
            </button>

            <button
                type="button"
                className="fb-link"
                onClick={() => navigate("/forgot-password")}
            >
                Забыли пароль?
            </button>
        </form>
    );
}
