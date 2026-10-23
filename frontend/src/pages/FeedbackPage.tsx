import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Capacitor } from "@capacitor/core";

import MobileShell from "../widgets/MobileShell";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import {
    feedbackApi,
    FEEDBACK_STATUS_LABELS,
    FEEDBACK_STATUS_PILL,
    FEEDBACK_TYPE_LABELS,
    type FeedbackItem,
    type FeedbackType,
} from "../shared/api/feedbackApi";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

const TYPES: FeedbackType[] = ["IDEA", "BUG", "OTHER"];
const PLACEHOLDERS: Record<FeedbackType, string> = {
    IDEA: "Чего не хватает в приложении? Что сделать удобнее?",
    BUG: "Что случилось и на каком экране? Что вы ожидали увидеть?",
    OTHER: "Ваш вопрос или сообщение",
};

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

/** FIT-73: trainers and clients send ideas / problem reports and see what happened to them. */
export default function FeedbackPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const fromScreen = (location.state as { from?: string } | null)?.from;

    const [type, setType] = useState<FeedbackType>("IDEA");
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [mine, setMine] = useState<FeedbackItem[]>([]);

    useEffect(() => {
        feedbackApi.getMine().then(setMine).catch(() => undefined);
    }, []);

    const handleSend = async () => {
        if (!text.trim()) {
            setErrorMessage("Напишите, что хотите предложить или что случилось");
            return;
        }
        setIsSending(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            const created = await feedbackApi.create({
                type,
                text: text.trim(),
                platform: Capacitor.getPlatform() === "web" ? "WEB" : Capacitor.getPlatform().toUpperCase(),
                screen: fromScreen,
            });
            setMine((prev) => [created, ...prev]);
            setText("");
            setSuccessMessage("Спасибо! Мы прочитаем и ответим статусом ниже.");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось отправить"));
        } finally {
            setIsSending(false);
        }
    };

    const back = (
        <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
    );

    return (
        <MobileShell title="Идеи и проблемы" left={back} showTabBar={false}>
            <div className="fb-tab-panel fb-feedback">
                <p className="fb-hint">
                    Расскажите, чего не хватает в FitApp или что работает не так. Мы читаем каждое сообщение.
                </p>

                <div className="fb-segment fb-feedback__types">
                    {TYPES.map((t) => (
                        <button
                            key={t}
                            type="button"
                            className={`fb-segment__item ${type === t ? "fb-segment__item--active" : ""}`}
                            onClick={() => setType(t)}
                        >
                            {FEEDBACK_TYPE_LABELS[t]}
                        </button>
                    ))}
                </div>

                <label className="fb-textarea">
                    <span className="fb-textarea__label">Сообщение</span>
                    <textarea
                        rows={5}
                        maxLength={4000}
                        value={text}
                        placeholder={PLACEHOLDERS[type]}
                        onChange={(event) => setText(event.target.value)}
                    />
                </label>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}
                {successMessage ? <div className="fb-success-note">{successMessage}</div> : null}

                <button type="button" className="fb-btn fb-btn--primary fb-form-submit" onClick={handleSend} disabled={isSending}>
                    {isSending ? "Отправляем…" : "Отправить"}
                </button>

                {mine.length > 0 && (
                    <>
                        <div className="fb-section-title fb-section-title--flush">Мои обращения</div>
                        <div className="fb-feedback__list">
                            {mine.map((item) => (
                                <div key={item.id} className="fb-breq__card">
                                    <div className="fb-breq__head">
                                        <div className="fb-breq__main">
                                            <div className="fb-breq__client">{FEEDBACK_TYPE_LABELS[item.type]}</div>
                                            <div className="fb-breq__when">{formatDate(item.createdAt)}</div>
                                        </div>
                                        <span className={`fb-pill ${FEEDBACK_STATUS_PILL[item.status]}`}>{FEEDBACK_STATUS_LABELS[item.status]}</span>
                                    </div>
                                    <div className="fb-breq__comment fb-feedback__text">{item.text}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </MobileShell>
    );
}
