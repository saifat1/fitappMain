import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FbTextField from "../../../shared/ui/FbTextField";
import FbPasswordField from "../../../shared/ui/FbPasswordField";
import { useAuth } from "../model/AuthContext";
import type { ApiErrorResponse } from "../model/auth.types";

export default function LoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
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
        </form>
    );
}
