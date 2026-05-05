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
    const [isMobileMetaOpen, setIsMobileMetaOpen] = useState(false);

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

    const applyToday = () => {
        const range = getTodayRange();
        setViewMode("today");
        setFrom(range.from);
        setTo(range.to);
        setDraftFrom(range.from);
        setDraftTo(range.to);
    };

    const applyWeek = () => {
        const range = getWeekRange();
        setViewMode("week");
        setFrom(range.from);
        setTo(range.to);
        setDraftFrom(range.from);
        setDraftTo(range.to);
    };

    const applyRange = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (draftFrom > draftTo) {
            setErrorMessage("Дата начала периода не может быть позже даты окончания");
            return;
        }

        setErrorMessage("");
        setFrom(draftFrom);
        setTo(draftTo);
    };

    const handleCreateTraining = async (e: FormEvent) => {
        e.preventDefault();

        if (!clientId) {
            setErrorMessage("Выбери клиента");
            return;
        }

        if (!startTime || !endTime) {
            setErrorMessage("Укажи время начала и окончания");
            return;
        }

        if (endTime <= startTime) {
            setErrorMessage("Время окончания должно быть позже времени начала");
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
        <div className="trainings-page trainings-page-compact entity-page-compact">
            <section className="trainings-header-bar entity-header-bar">
                <div className="trainings-header-main entity-header-main">
                    <h1 className="trainings-header-title entity-header-title">Тренировки</h1>

                    <div className="trainings-period-switch">
                        <button
                            type="button"
                            className={`trainings-period-btn ${viewMode === "today" ? "is-active" : ""}`}
                            onClick={applyToday}
                        >
                            Сегодня
                        </button>

                        <button
                            type="button"
                            className={`trainings-period-btn ${viewMode === "week" ? "is-active" : ""}`}
                            onClick={applyWeek}
                        >
                            7 дней
                        </button>

                        <button
                            type="button"
                            className={`trainings-period-btn ${viewMode === "range" ? "is-active" : ""}`}
                            onClick={() => setViewMode("range")}
                        >
                            Период
                        </button>
                    </div>
                </div>

                {isTrainer && (
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-primary trainings-create-top-btn entity-header-action"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Создать тренировку
                    </button>
                )}
            </section>

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            {showTodaySection && (
                <section className="trainings-panel trainings-panel-compact entity-panel-compact">
                    <div className="trainings-section-head entity-section-head">
                        <h2 className="trainings-section-title entity-section-title">Сегодня</h2>
                        <span className="trainings-section-count entity-section-count">
              {todayTrainings.length}
            </span>
                    </div>

                    {isLoading ? (
                        <div className="trainings-empty-text">Загрузка...</div>
                    ) : todayTrainings.length === 0 ? (
                        <div className="trainings-empty">
                            <div className="trainings-empty-title">На сегодня тренировок нет</div>
                            <div className="trainings-empty-text">
                                Выбери другой период или создай новую тренировку.
                            </div>
                        </div>
                    ) : (
                        <section className="trainings-list trainings-list-compact entity-list-compact">
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
                <section className="trainings-panel trainings-panel-compact entity-panel-compact">
                    <div className="trainings-section-head entity-section-head">
                        <h2 className="trainings-section-title entity-section-title">
                            {rangeIncludesToday ? "Остальные" : "Тренировки"}
                        </h2>
                        <span className="trainings-section-count entity-section-count">
              {otherItems.length}
            </span>
                    </div>

                    {isLoading ? (
                        <div className="trainings-empty-text">Загрузка...</div>
                    ) : otherItems.length === 0 ? (
                        <div className="trainings-empty">
                            <div className="trainings-empty-title">Тренировок нет</div>
                            <div className="trainings-empty-text">
                                В выбранном диапазоне записи отсутствуют.
                            </div>
                        </div>
                    ) : (
                        <section className="trainings-list trainings-list-compact entity-list-compact">
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

            <section className="trainings-meta-panel desktop-meta-panel entity-panel-compact">
                <TrainingQuickFilters
                    viewMode={viewMode}
                    draftFrom={draftFrom}
                    draftTo={draftTo}
                    isLoading={isLoading}
                    onSelectToday={applyToday}
                    onSelectWeek={applyWeek}
                    onSelectRange={() => setViewMode("range")}
                    onChangeDraftFrom={setDraftFrom}
                    onChangeDraftTo={setDraftTo}
                    onApplyRange={applyRange}
                />

                <TrainingsStats trainings={trainings} />
            </section>

            <section className="trainings-meta-panel mobile-meta-panel entity-panel-compact">
                <button
                    type="button"
                    className="trainings-mobile-meta-toggle"
                    onClick={() => setIsMobileMetaOpen((prev) => !prev)}
                >
                    <span>Фильтры и статистика</span>
                    <strong>{isMobileMetaOpen ? "Скрыть" : "Показать"}</strong>
                </button>

                {isMobileMetaOpen && (
                    <div className="trainings-mobile-meta-content">
                        <TrainingQuickFilters
                            viewMode={viewMode}
                            draftFrom={draftFrom}
                            draftTo={draftTo}
                            isLoading={isLoading}
                            onSelectToday={applyToday}
                            onSelectWeek={applyWeek}
                            onSelectRange={() => setViewMode("range")}
                            onChangeDraftFrom={setDraftFrom}
                            onChangeDraftTo={setDraftTo}
                            onApplyRange={applyRange}
                        />

                        <TrainingsStats trainings={trainings} />
                    </div>
                )}
            </section>

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