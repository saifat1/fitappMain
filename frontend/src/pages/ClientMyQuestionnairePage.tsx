import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { questionnaireApi } from "../shared/api/questionnaireApi";
import {
    HEALTH_CONDITIONS,
    TRAINING_EXPERIENCE_OPTIONS,
    FITNESS_GOAL_OPTIONS,
    PRIORITY_BODY_PART_OPTIONS,
    CONVENIENT_DAY_OPTIONS,
    CONVENIENT_TIME_OF_DAY_OPTIONS,
} from "../features/questionnaire/model/questionnaire.types";
import type { ClientQuestionnaireResponse } from "../features/questionnaire/model/questionnaire.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function labelsFor(codes: string[] | null | undefined, options: { code: string; label: string }[]): string {
    if (!codes || codes.length === 0) return "—";
    return codes
        .map((code) => options.find((o) => o.code === code)?.label ?? code)
        .join(", ");
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="fb-readonly">
            <span className="fb-readonly__label">{label}</span>
            <span className="fb-readonly__value">{value}</span>
        </div>
    );
}

export default function ClientMyQuestionnairePage() {
    const navigate = useNavigate();
    const [data, setData] = useState<ClientQuestionnaireResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let active = true;
        questionnaireApi
            .getMy()
            .then((response) => active && setData(response))
            .catch((error) => active && setErrorMessage(resolveApiError(error, "Не удалось загрузить анкету")))
            .finally(() => active && setIsLoading(false));
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">Моя анкета</h1>
            </header>

            <div className="fb-body">
                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : errorMessage ? (
                    <div className="fb-cal-error">{errorMessage}</div>
                ) : !data?.filled ? (
                    <div className="fb-empty">Тренер ещё не заполнил анкету</div>
                ) : (
                    <>
                        <div className="fb-section-title fb-section-title--flush">Личная информация</div>
                        <Row label="Рост" value={data.heightCm ? `${data.heightCm} см` : "—"} />
                        <Row label="Вес" value={data.weightKg ? `${data.weightKg} кг` : "—"} />
                        <Row label="Размер одежды" value={data.clothingSize ?? "—"} />
                        <Row label="Процент жира" value={data.bodyFatPercent ? `${data.bodyFatPercent}%` : "—"} />

                        <div className="fb-section-title">История здоровья</div>
                        <Row label="Отмечено" value={labelsFor(data.healthConditions, HEALTH_CONDITIONS)} />
                        {data.therapyType ? <Row label="Терапия" value={data.therapyType} /> : null}

                        <div className="fb-section-title">Опыт и цели</div>
                        <Row label="Опыт тренировок" value={labelsFor(data.trainingExperience, TRAINING_EXPERIENCE_OPTIONS)} />
                        <Row label="Тренировок в неделю" value={data.trainingsPerWeek ? String(data.trainingsPerWeek) : "—"} />
                        <Row label="Фитнес цели" value={labelsFor(data.fitnessGoals, FITNESS_GOAL_OPTIONS)} />
                        {data.fitnessGoalOther ? <Row label="Другая цель" value={data.fitnessGoalOther} /> : null}
                        <Row label="Желаемый вес" value={data.desiredWeightKg ? `${data.desiredWeightKg} кг` : "—"} />
                        <Row label="Приоритетные части тела" value={labelsFor(data.priorityBodyParts, PRIORITY_BODY_PART_OPTIONS)} />

                        <div className="fb-section-title">Удобное время</div>
                        <Row label="Дни" value={labelsFor(data.convenientDays, CONVENIENT_DAY_OPTIONS)} />
                        <Row label="Время суток" value={labelsFor(data.convenientTimeOfDay, CONVENIENT_TIME_OF_DAY_OPTIONS)} />
                        {data.convenientTimeNote ? <Row label="Точное время" value={data.convenientTimeNote} /> : null}

                        {data.nutritionRecommendations ? (
                            <>
                                <div className="fb-section-title">Рекомендации по питанию</div>
                                <p className="fb-field-hint">{data.nutritionRecommendations}</p>
                            </>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
}
