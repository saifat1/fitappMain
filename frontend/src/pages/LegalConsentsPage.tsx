import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { legalApi } from "../shared/api/legalApi";
import { useAuth } from "../features/auth/model/AuthContext";

type ConsentItem = {
    key: string;
    title: string;
    description: string;
    link: string;
    linkText: string;
    icon: string;
};

const CONSENTS: ConsentItem[] = [
    {
        key: "terms",
        title: "Пользовательское соглашение",
        description: "Правила использования сервиса ФитАпп",
        link: "/legal/terms",
        linkText: "Читать документ",
        icon: "📄",
    },
    {
        key: "privacy",
        title: "Политика обработки персональных данных",
        description: "Как мы собираем, используем и защищаем ваши данные",
        link: "/legal/privacy",
        linkText: "Читать документ",
        icon: "🛡️",
    },
    {
        key: "personal",
        title: "Согласие на обработку персональных данных",
        description: "Согласие на обработку ваших персональных данных",
        link: "/legal/personal-data-consent",
        linkText: "Читать документ",
        icon: "👤",
    },
    {
        key: "health",
        title: "Согласие на обработку данных о тренировках и здоровье",
        description: "Сведения о тренировках, физическом состоянии и здоровье",
        link: "/legal/health-data",
        linkText: "Читать документ",
        icon: "♡",
    },
];

export default function LegalConsentsPage() {
    const navigate = useNavigate();
    const { refreshConsentStatus } = useAuth();

    const [accepted, setAccepted] = useState<Record<string, boolean>>({
        terms: false,
        privacy: false,
        personal: false,
        health: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const canSubmit = CONSENTS.every((item) => accepted[item.key]);
    const allAccepted = canSubmit;

    const toggleConsent = (key: string) => {
        setAccepted((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const toggleAll = () => {
        const next = !allAccepted;
        setAccepted(Object.fromEntries(CONSENTS.map((item) => [item.key, next])));
    };

    const handleSubmit = async () => {
        if (!canSubmit || isSubmitting) {
            return;
        }

        try {
            setError("");
            setIsSubmitting(true);

            await legalApi.acceptRequiredConsents();
            await refreshConsentStatus();

            navigate("/me", { replace: true });
        } catch {
            setError("Не удалось сохранить согласия. Попробуйте ещё раз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <h1 className="fb-topbar__title">Документы и согласия</h1>
            </header>

            <div className="fb-body">
                <div className="fb-hint" style={{ paddingTop: 0 }}>
                    Для продолжения работы необходимо принять документы, связанные с
                    использованием приложения и обработкой персональных данных.
                </div>

                <button
                    type="button"
                    className="fb-btn fb-btn--ghost"
                    style={{ marginTop: 16 }}
                    onClick={toggleAll}
                >
                    {allAccepted ? "Снять все отметки" : "Принять все документы"}
                </button>

                <div className="fb-list" style={{ marginTop: 8 }}>
                    {CONSENTS.map((item) => (
                        <div className="fb-row" key={item.key}>
                            <span className="fb-row__main">
                                <span className="fb-row__title">
                                    {item.icon} {item.title}
                                </span>
                                <span className="fb-row__sub">
                                    {item.description} ·{" "}
                                    <Link to={item.link} style={{ color: "var(--fb-green)", fontWeight: 600 }}>
                                        {item.linkText}
                                    </Link>
                                </span>
                            </span>

                            <button
                                type="button"
                                className={`fb-row__radio ${accepted[item.key] ? "fb-row__radio--checked" : ""}`}
                                aria-label={`Принять: ${item.title}`}
                                onClick={() => toggleConsent(item.key)}
                            >
                                {accepted[item.key] ? "✓" : ""}
                            </button>
                        </div>
                    ))}
                </div>

                {error ? <div className="fb-cal-error">{error}</div> : null}

                <button
                    type="button"
                    className="fb-btn fb-btn--primary fb-form-submit"
                    disabled={!canSubmit || isSubmitting}
                    onClick={() => void handleSubmit()}
                >
                    {isSubmitting ? "Сохраняем…" : "Принять и продолжить"}
                </button>

                <div className="fb-hint" style={{ textAlign: "center" }}>
                    🔒 Ваши данные защищены и не передаются третьим лицам без вашего согласия
                </div>
            </div>
        </div>
    );
}
