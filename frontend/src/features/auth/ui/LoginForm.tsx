import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PasswordInput from "../../../shared/ui/PasswordInput";
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
        <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Введите email"
                    autoComplete="email"
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="password">Пароль</label>
                <PasswordInput
                    id="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Введите пароль"
                    autoComplete="current-password"
                    required
                />
            </div>

            {errorMessage && <div className="form-error">{errorMessage}</div>}

            <button
                type="submit"
                className="dashboard-btn dashboard-btn-primary"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Входим..." : "Войти"}
            </button>
        </form>
    );
}