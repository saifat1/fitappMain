import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import FbTextField from "../shared/ui/FbTextField";
import ChipToggleGroup from "../shared/ui/ChipToggleGroup";
import { questionnaireApi } from "../shared/api/questionnaireApi";
import {
    HEALTH_CONDITIONS,
    TRAINING_EXPERIENCE_OPTIONS,
    FITNESS_GOAL_OPTIONS,
    PRIORITY_BODY_PART_OPTIONS,
    CONVENIENT_DAY_OPTIONS,
    CONVENIENT_TIME_OF_DAY_OPTIONS,
} from "../features/questionnaire/model/questionnaire.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

export default function ClientQuestionnairePage() {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();
    const id = Number(clientId);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [savedMessage, setSavedMessage] = useState("");

    const [heightCm, setHeightCm] = useState("");
    const [weightKg, setWeightKg] = useState("");
    const [clothingSize, setClothingSize] = useState("");
    const [bodyFatPercent, setBodyFatPercent] = useState("");

    const [healthConditions, setHealthConditions] = useState<string[]>([]);
    const [therapyType, setTherapyType] = useState("");

    const [trainingExperience, setTrainingExperience] = useState<string[]>([]);
    const [trainingsPerWeek, setTrainingsPerWeek] = useState("");

    const [fitnessGoals, setFitnessGoals] = useState<string[]>([]);
    const [fitnessGoalOther, setFitnessGoalOther] = useState("");
    const [desiredWeightKg, setDesiredWeightKg] = useState("");

    const [priorityBodyParts, setPriorityBodyParts] = useState<string[]>([]);

    const [convenientDays, setConvenientDays] = useState<string[]>([]);
    const [convenientTimeOfDay, setConvenientTimeOfDay] = useState<string[]>([]);
    const [convenientTimeNote, setConvenientTimeNote] = useState("");

    const [nutritionRecommendations, setNutritionRecommendations] = useState("");
    const [instructorNotes, setInstructorNotes] = useState("");

    useEffect(() => {
        let active = true;

        questionnaireApi
            .getForClient(id)
            .then((data) => {
                if (!active) return;
                setHeightCm(data.heightCm?.toString() ?? "");
                setWeightKg(data.weightKg?.toString() ?? "");
                setClothingSize(data.clothingSize ?? "");
                setBodyFatPercent(data.bodyFatPercent?.toString() ?? "");
                setHealthConditions(data.healthConditions ?? []);
                setTherapyType(data.therapyType ?? "");
                setTrainingExperience(data.trainingExperience ?? []);
                setTrainingsPerWeek(data.trainingsPerWeek?.toString() ?? "");
                setFitnessGoals(data.fitnessGoals ?? []);
                setFitnessGoalOther(data.fitnessGoalOther ?? "");
                setDesiredWeightKg(data.desiredWeightKg?.toString() ?? "");
                setPriorityBodyParts(data.priorityBodyParts ?? []);
                setConvenientDays(data.convenientDays ?? []);
                setConvenientTimeOfDay(data.convenientTimeOfDay ?? []);
                setConvenientTimeNote(data.convenientTimeNote ?? "");
                setNutritionRecommendations(data.nutritionRecommendations ?? "");
                setInstructorNotes(data.instructorNotes ?? "");
            })
            .catch((error) => setErrorMessage(resolveApiError(error, "Не удалось загрузить анкету")))
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

    const handleSave = async () => {
        setIsSaving(true);
        setErrorMessage("");
        setSavedMessage("");

        try {
            await questionnaireApi.updateForClient(id, {
                heightCm: heightCm ? Number(heightCm) : null,
                weightKg: weightKg ? Number(weightKg) : null,
                clothingSize: clothingSize.trim() || null,
                bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : null,
                healthConditions,
                therapyType: therapyType.trim() || null,
                trainingExperience,
                trainingsPerWeek: trainingsPerWeek ? Number(trainingsPerWeek) : null,
                fitnessGoals,
                fitnessGoalOther: fitnessGoalOther.trim() || null,
                desiredWeightKg: desiredWeightKg ? Number(desiredWeightKg) : null,
                priorityBodyParts,
                convenientDays,
                convenientTimeOfDay,
                convenientTimeNote: convenientTimeNote.trim() || null,
                nutritionRecommendations: nutritionRecommendations.trim() || null,
                instructorNotes: instructorNotes.trim() || null,
            });
            setSavedMessage("Сохранено");
            window.setTimeout(() => setSavedMessage(""), 2000);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось сохранить анкету"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">Анкета</h1>
            </header>

            <div className="fb-body">
                {isLoading ? (
                    <div className="fb-cal-status">Загрузка…</div>
                ) : (
                    <>
                        <div className="fb-section-title fb-section-title--flush">Личная информация</div>
                        <FbTextField id="q-height" label="Рост, см" type="number" value={heightCm} onChange={setHeightCm} />
                        <FbTextField id="q-weight" label="Вес, кг" type="number" value={weightKg} onChange={setWeightKg} />
                        <FbTextField id="q-clothing" label="Размер одежды" value={clothingSize} onChange={setClothingSize} />
                        <FbTextField id="q-fat" label="Процент жира" type="number" value={bodyFatPercent} onChange={setBodyFatPercent} />

                        <div className="fb-section-title">История здоровья</div>
                        <ChipToggleGroup
                            label="Отметьте, что применимо"
                            options={HEALTH_CONDITIONS}
                            selected={healthConditions}
                            onChange={setHealthConditions}
                        />
                        <FbTextField
                            id="q-therapy"
                            label="Вид терапии, который проходит"
                            value={therapyType}
                            onChange={setTherapyType}
                        />

                        <div className="fb-section-title">Опыт тренировок и цели</div>
                        <ChipToggleGroup
                            label="Тренировались ли раньше"
                            options={TRAINING_EXPERIENCE_OPTIONS}
                            selected={trainingExperience}
                            onChange={setTrainingExperience}
                        />
                        <FbTextField
                            id="q-per-week"
                            label="Сколько раз в неделю необходимо заниматься (1–7)"
                            type="number"
                            value={trainingsPerWeek}
                            onChange={setTrainingsPerWeek}
                        />
                        <ChipToggleGroup
                            label="Фитнес цели"
                            options={FITNESS_GOAL_OPTIONS}
                            selected={fitnessGoals}
                            onChange={setFitnessGoals}
                        />
                        {fitnessGoals.includes("OTHER") && (
                            <FbTextField
                                id="q-goal-other"
                                label="Другая цель — уточните"
                                value={fitnessGoalOther}
                                onChange={setFitnessGoalOther}
                            />
                        )}
                        <FbTextField
                            id="q-desired-weight"
                            label="Желаемый вес, кг"
                            type="number"
                            value={desiredWeightKg}
                            onChange={setDesiredWeightKg}
                        />
                        <ChipToggleGroup
                            label="Приоритетные части тела"
                            options={PRIORITY_BODY_PART_OPTIONS}
                            selected={priorityBodyParts}
                            onChange={setPriorityBodyParts}
                        />

                        <div className="fb-section-title">Удобное время</div>
                        <ChipToggleGroup
                            label="Удобные дни"
                            options={CONVENIENT_DAY_OPTIONS}
                            selected={convenientDays}
                            onChange={setConvenientDays}
                        />
                        <ChipToggleGroup
                            label="Удобное время суток"
                            options={CONVENIENT_TIME_OF_DAY_OPTIONS}
                            selected={convenientTimeOfDay}
                            onChange={setConvenientTimeOfDay}
                        />
                        <FbTextField
                            id="q-time-note"
                            label="Точное удобное время"
                            value={convenientTimeNote}
                            onChange={setConvenientTimeNote}
                        />

                        <div className="fb-section-title">Рекомендации и заметки</div>
                        <div className="fb-field">
                            <label className="fb-field__label" htmlFor="q-nutrition">
                                Рекомендации по питанию
                            </label>
                            <div className="fb-field__control">
                                <textarea
                                    id="q-nutrition"
                                    className="fb-field__input"
                                    rows={3}
                                    value={nutritionRecommendations}
                                    onChange={(event) => setNutritionRecommendations(event.target.value)}
                                />
                            </div>
                        </div>
                        <div className="fb-field">
                            <label className="fb-field__label" htmlFor="q-notes">
                                Особые отметки инструктора
                            </label>
                            <div className="fb-field__control">
                                <textarea
                                    id="q-notes"
                                    className="fb-field__input"
                                    rows={3}
                                    value={instructorNotes}
                                    onChange={(event) => setInstructorNotes(event.target.value)}
                                />
                            </div>
                        </div>

                        {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}
                        {savedMessage ? <div className="fb-field-hint">{savedMessage}</div> : null}

                        <button
                            type="button"
                            className="fb-btn fb-btn--primary fb-form-submit"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Сохраняем…" : "Сохранить"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
