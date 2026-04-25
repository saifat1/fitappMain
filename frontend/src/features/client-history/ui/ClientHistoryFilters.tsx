import type { CSSProperties } from "react";
import type {
    ClientHistoryFiltersState,
    ClientHistoryPeriod,
    ClientHistoryStatusFilter,
} from "../model/clientHistory.types";

type Props = {
    filters: ClientHistoryFiltersState;
    onPeriodChange: (period: ClientHistoryPeriod) => void;
    onStatusChange: (status: ClientHistoryStatusFilter) => void;
    onQueryChange: (query: string) => void;
    onShowOnlyWithNotesChange: (value: boolean) => void;
};

const filterBarStyle: CSSProperties = {
    display: "grid",
    gap: 12,
};

const filterRowStyle: CSSProperties = {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
};

const chipStyle: CSSProperties = {
    minHeight: 38,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid #d7deea",
    background: "#ffffff",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
};

const activeChipStyle: CSSProperties = {
    ...chipStyle,
    borderColor: "#14b8a6",
    background: "#ecfeff",
    color: "#0f766e",
};

export default function ClientHistoryFilters({
                                                 filters,
                                                 onPeriodChange,
                                                 onStatusChange,
                                                 onQueryChange,
                                                 onShowOnlyWithNotesChange,
                                             }: Props) {
    return (
        <section className="dashboard-card">
            <div style={filterBarStyle}>
                <div style={filterRowStyle}>
                    {(["7d", "30d", "90d", "all"] as const).map((period) => (
                        <button
                            key={period}
                            type="button"
                            style={filters.period === period ? activeChipStyle : chipStyle}
                            onClick={() => onPeriodChange(period)}
                        >
                            {period === "7d"
                                ? "7 дней"
                                : period === "30d"
                                    ? "30 дней"
                                    : period === "90d"
                                        ? "90 дней"
                                        : "Всё время"}
                        </button>
                    ))}
                </div>

                <div style={filterRowStyle}>
                    {(["ALL", "PLANNED", "COMPLETED", "CANCELLED"] as const).map((status) => (
                        <button
                            key={status}
                            type="button"
                            style={filters.status === status ? activeChipStyle : chipStyle}
                            onClick={() => onStatusChange(status)}
                        >
                            {status === "ALL"
                                ? "Все статусы"
                                : status === "PLANNED"
                                    ? "Запланированные"
                                    : status === "COMPLETED"
                                        ? "Завершённые"
                                        : "Отменённые"}
                        </button>
                    ))}
                </div>

                <div style={filterRowStyle}>
                    <input
                        value={filters.query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Поиск по дате, заметке, упражнению, весу"
                        style={{
                            minHeight: 42,
                            padding: "0 14px",
                            borderRadius: 12,
                            border: "1px solid #d7deea",
                            minWidth: 280,
                            flex: "1 1 320px",
                            boxSizing: "border-box",
                        }}
                    />

                    <label
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            minHeight: 42,
                            padding: "0 12px",
                            borderRadius: 12,
                            border: "1px solid #d7deea",
                            background: "#ffffff",
                            color: "#334155",
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={filters.showOnlyWithNotes}
                            onChange={(event) => onShowOnlyWithNotesChange(event.target.checked)}
                        />
                        Только с заметками
                    </label>
                </div>
            </div>
        </section>
    );
}