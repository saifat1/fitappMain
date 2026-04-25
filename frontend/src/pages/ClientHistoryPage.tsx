import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { clientHistoryApi } from "../shared/api/clientHistoryApi";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import type {
    ClientHistoryFiltersState,
    ClientHistoryResponse,
} from "../features/client-history/model/clientHistory.types";
import {
    formatTrainingDateLabel,
    formatTrainingTimeRange,
} from "../features/client-history/lib/clientHistoryFormat";
import {
    buildClientHistoryStats,
    filterClientHistoryTrainings,
} from "../features/client-history/lib/clientHistoryFilters";
import ClientHistoryHeader from "../features/client-history/ui/ClientHistoryHeader";
import ClientHistoryStats from "../features/client-history/ui/ClientHistoryStats";
import ClientHistoryFilters from "../features/client-history/ui/ClientHistoryFilters";
import ClientHistoryList from "../features/client-history/ui/ClientHistoryList";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

export default function ClientHistoryPage() {
    const { clientId } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState<ClientHistoryResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [filters, setFilters] = useState<ClientHistoryFiltersState>({
        period: "30d",
        status: "ALL",
        query: "",
        showOnlyWithNotes: false,
    });
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    useEffect(() => {
        async function load() {
            if (!clientId) {
                setErrorMessage("Не указан клиент");
                setIsLoading(false);
                return;
            }

            setErrorMessage("");
            setIsLoading(true);

            try {
                const response = await clientHistoryApi.getClientHistory(Number(clientId));
                setData(response);
            } catch (error) {
                setErrorMessage(resolveApiError(error, "Не удалось загрузить историю клиента"));
            } finally {
                setIsLoading(false);
            }
        }

        void load();
    }, [clientId]);

    const filteredTrainings = useMemo(() => {
        return filterClientHistoryTrainings(data?.trainings ?? [], filters);
    }, [data, filters]);

    const stats = useMemo(() => {
        return buildClientHistoryStats(filteredTrainings);
    }, [filteredTrainings]);

    const toggleExpanded = (trainingId: number) => {
        setExpandedIds((prev) =>
            prev.includes(trainingId)
                ? prev.filter((id) => id !== trainingId)
                : [...prev, trainingId]
        );
    };

    if (isLoading) {
        return <div className="dashboard-page">Загрузка...</div>;
    }

    if (!data) {
        return (
            <div className="dashboard-page">
                {errorMessage && <div className="error-box">{errorMessage}</div>}
                <div className="dashboard-card">История клиента не найдена</div>
            </div>
        );
    }

    const latestTrainingLabel = stats.latestTraining
        ? `${formatTrainingDateLabel(stats.latestTraining.trainingDate)} · ${formatTrainingTimeRange(
            stats.latestTraining.startTime,
            stats.latestTraining.endTime
        )}`
        : "—";

    return (
        <div className="dashboard-page">
            <ClientHistoryHeader
                client={data.client}
                onBack={() => navigate("/trainer/clients")}
                onOpenClient={() => navigate(`/trainer/clients/${data.client.id}`)}
                onCreateTraining={() => navigate("/trainings")}
            />

            {errorMessage && <div className="error-box">{errorMessage}</div>}

            <ClientHistoryStats
                total={stats.total}
                completed={stats.completed}
                cancelled={stats.cancelled}
                latestTrainingLabel={latestTrainingLabel}
                completionRate={stats.completionRate}
            />

            <ClientHistoryFilters
                filters={filters}
                onPeriodChange={(period) =>
                    setFilters((prev) => ({
                        ...prev,
                        period,
                    }))
                }
                onStatusChange={(status) =>
                    setFilters((prev) => ({
                        ...prev,
                        status,
                    }))
                }
                onQueryChange={(query) =>
                    setFilters((prev) => ({
                        ...prev,
                        query,
                    }))
                }
                onShowOnlyWithNotesChange={(showOnlyWithNotes) =>
                    setFilters((prev) => ({
                        ...prev,
                        showOnlyWithNotes,
                    }))
                }
            />

            <ClientHistoryList
                trainings={filteredTrainings}
                expandedIds={expandedIds}
                onToggleExpanded={(trainingId: number) => {
                    toggleExpanded(trainingId);
                }}
                onOpenTraining={(trainingId: number) => {
                    navigate(`/trainings/${trainingId}`);
                }}
            />
        </div>
    );
}