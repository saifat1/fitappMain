import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { bookingRequestApi } from "../../../shared/api/bookingRequestApi";
import { isReschedule } from "../lib/rescheduleView";

function pluralRequests(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return "запрос";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "запроса";
    return "запросов";
}

/**
 * Trainer calendar: a quiet row shown only while some reschedule requests
 * wait for an answer. Nothing is rendered when there are none (or on error).
 */
export default function PendingReschedulesBanner() {
    const navigate = useNavigate();
    const [pending, setPending] = useState(0);

    useEffect(() => {
        let cancelled = false;
        bookingRequestApi
            .getTrainerBookingRequests()
            .then((list) => {
                if (!cancelled) {
                    setPending(list.filter((r) => isReschedule(r) && r.status === "PENDING").length);
                }
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, []);

    if (pending === 0) {
        return null;
    }

    return (
        <button type="button" className="fb-reschedule-banner" onClick={() => navigate("/reschedule-requests")}>
            <span className="fb-reschedule-banner__count">{pending}</span>
            <span className="fb-reschedule-banner__text">
                {pluralRequests(pending)} на перенос {pending % 10 === 1 && pending % 100 !== 11 ? "ждёт" : "ждут"} ответа
            </span>
            <span className="fb-row__chevron">›</span>
        </button>
    );
}
