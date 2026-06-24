import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import FbTextField from "../shared/ui/FbTextField";
import { trainerApi } from "../shared/api/trainerApi";
import type { InviteResponse } from "../features/trainer/model/trainer.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ClientCreatePage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [invite, setInvite] = useState<InviteResponse | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCreate = async () => {
        if (!email.trim()) {
            setErrorMessage("Укажите электронную почту");
            return;
        }
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const client = await trainerApi.createManualClient({
                email: email.trim(),
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
            });
            const createdInvite = await trainerApi.createInviteForClient(client.id);
            setInvite(createdInvite);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось создать клиента"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = async () => {
        if (!invite) return;
        try {
            await navigator.clipboard.writeText(invite.registrationLink);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setErrorMessage("Не удалось скопировать ссылку");
        }
    };

    if (invite) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <h1 className="fb-topbar__title">Новый клиент</h1>
                </header>

                <div className="fb-body">
                    <div className="fb-confirm">
                        <svg className="fb-confirm__icon" viewBox="0 0 96 96" fill="none" aria-hidden="true">
                            <rect x="8" y="8" width="80" height="80" rx="20" fill="#34a853" />
                            <path d="M30 50l12 12 24-26" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="fb-confirm__title">Клиент создан</h2>
                        <p className="fb-confirm__text">
                            Для завершения регистрации клиент должен перейти по ссылке-приглашению.
                            Отправьте её сейчас или скопируйте позже из карточки клиента.
                        </p>

                        <div className="fb-linkbox">
                            <span className="fb-linkbox__url">{invite.registrationLink}</span>
                            <button type="button" className="fb-linkbox__copy" onClick={handleCopy} aria-label="Скопировать">
                                {copied ? "✓" : "⧉"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="fb-btn fb-btn--primary fb-form-submit"
                        onClick={() => navigate("/trainer/clients")}
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">Новый клиент</h1>
            </header>

            <div className="fb-body">
                <FbTextField
                    id="cl-email"
                    label="Электронная почта"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    error={errorMessage || undefined}
                    autoComplete="email"
                />
                <FbTextField id="cl-first" label="Имя, опционально" value={firstName} onChange={setFirstName} />
                <FbTextField id="cl-last" label="Фамилия, опционально" value={lastName} onChange={setLastName} />

                <button
                    type="button"
                    className="fb-btn fb-btn--primary fb-form-submit"
                    onClick={handleCreate}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Создаём…" : "Создать клиента"}
                </button>
            </div>
        </div>
    );
}
