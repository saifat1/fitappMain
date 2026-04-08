import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../model/AuthContext";
import type { ApiErrorResponse } from "../model/auth.types";
import axios from "axios";

type Props = {
    token: string;
};

export default function RegisterByInviteForm({ token }: Props) {
    const { registerByInvite } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("client@test.local");
    const [password, setPassword] = useState("123456");
    const [firstName, setFirstName] = useState("Ivan");
    const [lastName, setLastName] = useState("Client");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await registerByInvite({
                token,
                email,
                password,
                firstName,
                lastName,
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
        <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
                <label htmlFor="reg-email">Email</label>
                <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Введите email"
                    autoComplete="email"
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="reg-password">Пароль</label>
                <input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Введите пароль"
                    autoComplete="new-password"
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="first-name">Имя</label>
                <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Введите имя"
                    required
                />
            </div>

            <div className="form-row">
                <label htmlFor="last-name">Фамилия</label>
                <input
                    id="last-name"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Введите фамилию"
                    required
                />
            </div>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Регистрируем..." : "Зарегистрироваться"}
            </button>
        </form>
    );
}