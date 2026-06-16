import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ExerciseTemplateForm from "../features/exercise-template/ui/ExerciseTemplateForm";
import { exerciseTemplateApi } from "../shared/api/exerciseTemplateApi";
import type { CreateExerciseTemplateRequest } from "../features/exercise-template/model/exerciseTemplate.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ExerciseTemplateCreatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (payload: CreateExerciseTemplateRequest) => {
        setIsSubmitting(true);
        setErrorMessage("");

        try {
            await exerciseTemplateApi.createTemplate(payload);
            navigate("/exercise-templates");
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось создать упражнение"));
        } finally {
            setIsSubmitting(false);
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
                <h1 className="fb-topbar__title">Новое упражнение</h1>
            </header>

            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            <ExerciseTemplateForm
                isSubmitting={isSubmitting}
                submitLabel="Сохранить"
                onSubmit={handleSubmit}
            />
        </div>
    );
}
