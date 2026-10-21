import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import Avatar from "../shared/ui/Avatar";
import { trainerApi } from "../shared/api/trainerApi";
import {
    clientName,
    clientInitials,
    clientColor,
    clientStatusPill,
    isArchivedClient,
} from "../features/trainer/lib/clientDisplay";
import type { TrainerClientResponse } from "../features/trainer/model/trainer.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

const PAGE_SIZE = 20;

type Tab = "active" | "archive";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function matchesSearch(client: TrainerClientResponse, query: string): boolean {
    if (!query) return true;
    const haystack = [clientName(client), client.email, client.phone ?? ""].join(" ").toLowerCase();
    return haystack.includes(query);
}

export default function ClientsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tab: Tab = searchParams.get("tab") === "archive" ? "archive" : "active";

    const [clients, setClients] = useState<TrainerClientResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const data = await trainerApi.getClients();
            setClients(data);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить клиентов"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const counts = useMemo(() => {
        const archived = clients.filter(isArchivedClient).length;
        return { active: clients.length - archived, archive: archived };
    }, [clients]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return clients
            .filter((c) => (tab === "archive") === isArchivedClient(c))
            .filter((c) => matchesSearch(c, query))
            .sort((a, b) => clientName(a).localeCompare(clientName(b), "ru", { sensitivity: "base" }));
    }, [clients, tab, search]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const switchTab = (next: Tab) => {
        setSearchParams(next === "archive" ? { tab: "archive" } : {}, { replace: true });
        setPage(1);
    };

    const changeSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const emptyText = search.trim()
        ? "Никого не найдено"
        : tab === "archive"
            ? "В архиве пока никого нет"
            : "Клиентов пока нет";

    return (
        <MobileShell
            title="Клиенты"
            fab={
                tab === "active" ? (
                    <button
                        type="button"
                        className="fb-fab"
                        aria-label="Новый клиент"
                        onClick={() => navigate("/trainer/clients/new")}
                    >
                        +
                    </button>
                ) : undefined
            }
        >
            <div className="fb-segment">
                <button
                    type="button"
                    className={`fb-segment__item ${tab === "active" ? "fb-segment__item--active" : ""}`}
                    onClick={() => switchTab("active")}
                >
                    Клиенты{counts.active ? ` · ${counts.active}` : ""}
                </button>
                <button
                    type="button"
                    className={`fb-segment__item ${tab === "archive" ? "fb-segment__item--active" : ""}`}
                    onClick={() => switchTab("archive")}
                >
                    Архив{counts.archive ? ` · ${counts.archive}` : ""}
                </button>
            </div>

            <div className="fb-search">
                <input
                    type="search"
                    value={search}
                    onChange={(event) => changeSearch(event.target.value)}
                    placeholder="Поиск по имени, email или телефону"
                    aria-label="Поиск клиента"
                />
            </div>

            {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

            {isLoading ? (
                <div className="fb-empty">Загрузка…</div>
            ) : visible.length === 0 ? (
                <div className="fb-empty">{emptyText}</div>
            ) : (
                <div className="fb-list">
                    {visible.map((client) => {
                        const pill = clientStatusPill(client);
                        return (
                            <button
                                key={client.id}
                                type="button"
                                className="fb-row fb-row--button"
                                onClick={() => navigate(`/trainer/clients/${client.id}`)}
                            >
                                <Avatar initials={clientInitials(client)} color={clientColor(client)} size="md" />
                                <span className="fb-row__main">
                                    <span className="fb-row__title">{clientName(client)}</span>
                                    {tab === "active" && <span className="fb-row__sub">{client.email}</span>}
                                </span>
                                {tab === "active" && <span className={`fb-pill ${pill.cls}`}>{pill.label}</span>}
                            </button>
                        );
                    })}
                </div>
            )}

            {!isLoading && pageCount > 1 && (
                <div className="fb-pager">
                    <button
                        type="button"
                        className="fb-pager__btn"
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        aria-label="Предыдущая страница"
                    >
                        ‹
                    </button>
                    <span className="fb-pager__info">
                        Стр. {currentPage} из {pageCount}
                    </span>
                    <button
                        type="button"
                        className="fb-pager__btn"
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage >= pageCount}
                        aria-label="Следующая страница"
                    >
                        ›
                    </button>
                </div>
            )}
        </MobileShell>
    );
}
