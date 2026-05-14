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

    const toggleConsent = (key: string) => {
        setAccepted((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
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
        <main className="legal-consents-page">
            <section className="legal-consents-shell">
                <div className="legal-consents-header">
                    <h1>Документы и согласия</h1>
                    <p>
                        Для продолжения работы необходимо принять документы, связанные с
                        использованием приложения и обработкой персональных данных.
                    </p>
                </div>

                <div className="legal-consents-list">
                    {CONSENTS.map((item) => (
                        <article className="legal-consent-card" key={item.key}>
                            <div className="legal-consent-icon">{item.icon}</div>

                            <div className="legal-consent-body">
                                <h2>{item.title}</h2>
                                <p>{item.description}</p>
                            </div>

                            <Link className="legal-consent-link" to={item.link}>
                                {item.linkText} ↗
                            </Link>

                            <button
                                type="button"
                                className={
                                    accepted[item.key]
                                        ? "legal-consent-check is-active"
                                        : "legal-consent-check"
                                }
                                onClick={() => toggleConsent(item.key)}
                                aria-label={`Принять: ${item.title}`}
                            >
                                {accepted[item.key] ? "✓" : ""}
                            </button>
                        </article>
                    ))}
                </div>

                {error && <div className="legal-consents-error">{error}</div>}

                <button
                    type="button"
                    className="legal-consents-submit"
                    disabled={!canSubmit || isSubmitting}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? "Сохраняем..." : "Принять и продолжить"}
                </button>

                <div className="legal-consents-note">
                    🔒 Ваши данные защищены и не передаются третьим лицам без вашего
                    согласия
                </div>
            </section>
        </main>
    );
}