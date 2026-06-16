import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ExerciseTemplateForm from "../features/exercise-template/ui/ExerciseTemplateForm";
import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";
import type {
    CreateExerciseTemplateRequest,
    ExerciseTemplateResponse,
} from "../features/exercise-template/model/exerciseTemplate.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ExerciseTemplateDetailsPage() {
    const navigate = useNavigate();
    const { templateId } = useParams<{ templateId: string }>();
    const id = Number(templateId);

    const [template, setTemplate] = useState<ExerciseTemplateResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let active = true;

        (async () => {
            setIsLoading(true);
            try {
                const data = await exerciseTemplateApi.getTemplate(id);
                if (active) {
                    setTemplate(data);
                }
            } catch (error) {
                if (active) {
                    setErrorMessage(resolveApiError(error, "Не удалось загрузить упражнение"));
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            active = false;
        };
    }, [id]);

    const handleSubmit = async (payload: CreateExerciseTemplateRequest) => {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await exerciseTemplateApi.updateTemplate(id, payload);
            navigate("/exercise-templates");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось сохранить упражнение"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleArchive = async () => {
        if (!window.confirm("Удалить упражнение?")) {
            return;
        }

        setErrorMessage("");

        try {
            await exerciseTemplateApi.archiveTemplate(id);
            navigate("/exercise-templates");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось удалить упражнение"));
        }
    };

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button
                    type="button"
                    className="fb-topbar__back"
                    aria-label="Назад"
                    onClick={() => navigate(-1)}
                >
                    ‹
                </button>
                <h1 className="fb-topbar__title">Упражнение</h1>
                <button
                    type="button"
                    className="fb-topbar__action"
                    aria-label="Удалить"
                    onClick={handleArchive}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                    </svg>
                </button>
            </header>

            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            {isLoading ? (
                <div className="fb-cal-status">Загрузка…</div>
            ) : (
                <ExerciseTemplateForm
                    initial={template}
                    isSubmitting={isSubmitting}
                    submitLabel="Сохранить"
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}
