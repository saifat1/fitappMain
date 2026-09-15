import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FbTextField from "../../../shared/ui/FbTextField";
import FbPasswordField from "../../../shared/ui/FbPasswordField";
import { useAuth } from "../model/AuthContext";
import type { ApiErrorResponse } from "../model/auth.types";

type Props = {
    token: string;
    initialEmail?: string;
};

export default function RegisterByInviteForm({
    token,
    initialEmail = "",
}: Props) {
    const { registerByInvite } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
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
        <form className="fb-body" onSubmit={handleSubmit} autoComplete="off">
            <FbTextField
                id="reg-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                required
            />

            <FbTextField
                id="first-name"
                label="Имя"
                value={firstName}
                onChange={setFirstName}
                autoComplete="given-name"
                required
            />

            <FbTextField
                id="last-name"
                label="Фамилия"
                value={lastName}
                onChange={setLastName}
                autoComplete="family-name"
                required
            />

            <FbPasswordField
                id="reg-password"
                label="Пароль"
                value={password}
                onChange={setPassword}
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
        </form>
    );
}
