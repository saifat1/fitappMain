import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";
import {
    feedbackApi,
    FEEDBACK_STATUS_LABELS,
    FEEDBACK_STATUS_PILL,
    FEEDBACK_TYPE_LABELS,
    type FeedbackItem,
    type FeedbackStatus,
} from "../shared/api/feedbackApi";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

const STATUSES: FeedbackStatus[] = ["NEW", "ACCEPTED", "PLANNED", "DONE", "DECLINED"];

/** Admin (FIT-73): all ideas / problem reports with the author; the status is what the author sees. */
export default function AdminFeedbackPage() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<FeedbackStatus | "ALL">("NEW");
    const [items, setItems] = useState<FeedbackItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const load = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            setItems(await feedbackApi.getAll(filter === "ALL" ? undefined : filter));
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить обращения"));
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        void load();
    }, [load]);

    const changeStatus = async (item: FeedbackItem, status: FeedbackStatus) => {
        try {
            const updated = await feedbackApi.updateStatus(item.id, status);
            setItems((prev) => prev.map((x) => (x.id === item.id ? updated : x)));
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось сменить статус"));
        }
    };

    const back = (
        <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
    );

    return (
        <MobileShell title="Обращения" left={back} showTabBar={false}>
            <div className="fb-tab-panel fb-feedback">
                <div className="fb-chips fb-chips--wrap">
                    {(["ALL", ...STATUSES] as const).map((s) => (
                        <button
                            key={s}
                            type="button"
                            className={`fb-chip ${filter === s ? "fb-chip--active" : ""}`}
                            onClick={() => setFilter(s)}
                        >
                            {s === "ALL" ? "Все" : FEEDBACK_STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                {isLoading ? (
                    <div className="fb-empty">Загрузка…</div>
                ) : items.length === 0 ? (
                    <div className="fb-empty">Обращений нет</div>
                ) : (
                    <div className="fb-feedback__list">
                        {items.map((item) => (
                            <div key={item.id} className="fb-breq__card">
                                <div className="fb-breq__head">
                                    <div className="fb-breq__main">
                                        <div className="fb-breq__client">
                                            {FEEDBACK_TYPE_LABELS[item.type]} · {item.authorName}
                                        </div>
                                        <div className="fb-breq__when">
                                            {item.authorRole === "TRAINER" ? "тренер" : "клиент"} · {item.authorEmail} ·{" "}
                                            {new Date(item.createdAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                            {" · "}{item.platform}{item.screen ? ` · ${item.screen}` : ""}
                                        </div>
                                    </div>
                                    <span className={`fb-pill ${FEEDBACK_STATUS_PILL[item.status]}`}>{FEEDBACK_STATUS_LABELS[item.status]}</span>
                                </div>
                                <div className="fb-breq__comment fb-feedback__text">{item.text}</div>
                                <select
                                    className="fb-feedback__status"
                                    value={item.status}
                                    aria-label="Статус обращения"
                                    onChange={(event) => void changeStatus(item, event.target.value as FeedbackStatus)}
                                >
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>{FEEDBACK_STATUS_LABELS[s]}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MobileShell>
    );
}
