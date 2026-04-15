import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { trainingApi } from "../shared/api/trainingApi";
import { trainerApi } from "../shared/api/trainerApi";
import { useAuth } from "../features/auth/model/AuthContext";

import TrainingCreateModal from "../features/training/ui/TrainingCreateModal";
import TrainingQuickFilters from "../features/training/ui/TrainingQuickFilters";
import TrainingCard from "../features/training/ui/TrainingCard";
import TrainingsStats from "../features/training/ui/TrainingsStats";

import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type { TrainingResponse } from "../features/training/model/training.types";
import type { TrainerClientResponse } from "../features/trainer/model/trainer.types";

import {
    formatDateForInput,
    getTodayRange,
    getWeekRange,
    partitionTrainingsByToday,
    sortTrainingsByDateTime,
    type TrainingViewMode,
} from "../features/training/lib/trainingView";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

export default function TrainingsPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isTrainer = currentUser?.role === "TRAINER";

    const initialRange = getTodayRange();

    const [viewMode, setViewMode] = useState<TrainingViewMode>("today");
    const [from, setFrom] = useState(initialRange.from);
    const [to, setTo] = useState(initialRange.to);
    const [draftFrom, setDraftFrom] = useState(initialRange.from);
    const [draftTo, setDraftTo] = useState(initialRange.to);

    const [trainings, setTrainings] = useState<TrainingResponse[]>([]);
    const [clients, setClients] = useState<TrainerClientResponse[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [processingTrainingId, setProcessingTrainingId] = useState<number | null>(null);

    const [clientId, setClientId] = useState("");
    const [trainingDate, setTrainingDate] = useState(formatDateForInput(new Date()));
    const [startTime, setStartTime] = useState("18:00");
    const [endTime, setEndTime] = useState("19:00");
    const [trainerNote, setTrainerNote] = useState("");

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const loadClients = useCallback(async () => {
        if (!isTrainer) {
            return;
        }

        try {
            const data = await trainerApi.getClients();
            setClients(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить клиентов"));
        }
    }, [isTrainer]);

    const loadTrainings = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await trainingApi.getTrainings(from, to);
            setTrainings(sortTrainingsByDateTime(data));
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить тренировки"));
        } finally {
            setIsLoading(false);
        }
    }, [from, to]);

    useEffect(() => {
        void loadClients();
    }, [loadClients]);

    useEffect(() => {
        void loadTrainings();
    }, [loadTrainings]);

    useEffect(() => {
        if (!clientId && clients.length > 0) {
            setClientId(String(clients[0].id));
        }
    }, [clients, clientId]);

    const handleCreateTraining = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!clientId) {
            setErrorMessage("Выбери клиента");
            return;
        }

        setIsCreating(true);
        setErrorMessage("");

        try {
            await trainingApi.createTraining({
                clientId: Number(clientId),
                trainingDate,
                startTime,
                endTime,
                trainerNote,
            });

            setTrainerNote("");
            setIsCreateOpen(false);
            await loadTrainings();
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Ошибка создания тренировки"));
        } finally {
            setIsCreating(false);
        }
    };

    const handleComplete = async (id: number) => {
        const previous = trainings;

        setProcessingTrainingId(id);
        setErrorMessage("");

        setTrainings((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, status: "COMPLETED" } : item
            )
        );

        try {
            await trainingApi.completeTraining(id);
        } catch (error) {
            setTrainings(previous);
            setErrorMessage(resolveApiError(error, "Ошибка завершения тренировки"));
        } finally {
            setProcessingTrainingId(null);
        }
    };

    const handleCancel = async (id: number) => {
        const previous = trainings;

        setProcessingTrainingId(id);
        setErrorMessage("");

        setTrainings((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, status: "CANCELLED" } : item
            )
        );

        try {
            await trainingApi.cancelTraining(id);
        } catch (error) {
            setTrainings(previous);
            setErrorMessage(resolveApiError(error, "Ошибка отмены тренировки"));
        } finally {
            setProcessingTrainingId(null);
        }
    };

    const { todayTrainings, otherTrainings, rangeIncludesToday } = useMemo(
        () => partitionTrainingsByToday(trainings, from, to),
        [trainings, from, to]
    );

    const showTodaySection = viewMode === "today" || rangeIncludesToday;
    const showOtherSection = viewMode !== "today";
    const otherItems = rangeIncludesToday ? otherTrainings : trainings;

    return (
        <div className="trainings-page">
            <section className="trainings-hero">
                <div>
                    <h1>Тренировки</h1>
                    <p>Фокус на сегодня</p>
                </div>

                {isTrainer && (
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-primary"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Создать тренировку
                    </button>
                )}
            </section>

            <TrainingsStats trainings={trainings} />

            <TrainingQuickFilters
                viewMode={viewMode}
                draftFrom={draftFrom}
                draftTo={draftTo}
                isLoading={isLoading}
                onSelectToday={() => {
                    const range = getTodayRange();
                    setViewMode("today");
                    setFrom(range.from);
                    setTo(range.to);
                    setDraftFrom(range.from);
                    setDraftTo(range.to);
                }}
                onSelectWeek={() => {
                    const range = getWeekRange();
                    setViewMode("week");
                    setFrom(range.from);
                    setTo(range.to);
                    setDraftFrom(range.from);
                    setDraftTo(range.to);
                }}
                onSelectRange={() => setViewMode("range")}
                onChangeDraftFrom={setDraftFrom}
                onChangeDraftTo={setDraftTo}
                onApplyRange={(e) => {
                    e.preventDefault();

                    if (draftFrom > draftTo) {
                        setErrorMessage("Дата начала периода не может быть позже даты окончания");
                        return;
                    }

                    setErrorMessage("");
                    setFrom(draftFrom);
                    setTo(draftTo);
                }}
            />

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            {showTodaySection && (
                <section className="trainings-panel">
                    <div className="trainings-panel-header">
                        <div>
                            <div className="trainings-panel-kicker">Сегодня</div>
                            <h2 className="trainings-panel-title">Тренировки на сегодня</h2>
                        </div>
                    </div>

                    {todayTrainings.length === 0 ? (
                        <div className="trainings-empty">
                            <div className="trainings-empty-title">На сегодня тренировок нет</div>
                            <div className="trainings-empty-text">
                                Выбери другой период или создай новую тренировку.
                            </div>
                        </div>
                    ) : (
                        <section className="trainings-list">
                            {todayTrainings.map((training) => (
                                <TrainingCard
                                    key={training.id}
                                    training={training}
                                    isTrainer={isTrainer}
                                    isProcessing={processingTrainingId === training.id}
                                    onOpen={(id) => navigate(`/trainings/${id}`)}
                                    onComplete={handleComplete}
                                    onCancel={handleCancel}
                                />
                            ))}
                        </section>
                    )}
                </section>
            )}

            {showOtherSection && (
                <section className="trainings-panel">
                    <div className="trainings-panel-header">
                        <div>
                            <div className="trainings-panel-kicker">
                                {viewMode === "week" ? "7 дней" : "Период"}
                            </div>
                            <h2 className="trainings-panel-title">
                                {rangeIncludesToday
                                    ? "Остальные тренировки в периоде"
                                    : "Тренировки в выбранном периоде"}
                            </h2>
                        </div>
                    </div>

                    {otherItems.length === 0 ? (
                        <div className="trainings-empty">
                            <div className="trainings-empty-title">Тренировок нет</div>
                            <div className="trainings-empty-text">
                                В выбранном диапазоне записи отсутствуют.
                            </div>
                        </div>
                    ) : (
                        <section className="trainings-list">
                            {otherItems.map((training) => (
                                <TrainingCard
                                    key={training.id}
                                    training={training}
                                    isTrainer={isTrainer}
                                    isProcessing={processingTrainingId === training.id}
                                    onOpen={(id) => navigate(`/trainings/${id}`)}
                                    onComplete={handleComplete}
                                    onCancel={handleCancel}
                                />
                            ))}
                        </section>
                    )}
                </section>
            )}

            {isTrainer && (
                <TrainingCreateModal
                    isOpen={isCreateOpen}
                    isSubmitting={isCreating}
                    clients={clients}
                    clientId={clientId}
                    trainingDate={trainingDate}
                    startTime={startTime}
                    endTime={endTime}
                    trainerNote={trainerNote}
                    onChangeClientId={setClientId}
                    onChangeDate={setTrainingDate}
                    onChangeStartTime={setStartTime}
                    onChangeEndTime={setEndTime}
                    onChangeNote={setTrainerNote}
                    onSubmit={handleCreateTraining}
                    onClose={() => setIsCreateOpen(false)}
                />
            )}
        </div>
    );
}