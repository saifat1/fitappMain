import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import { subscriptionApi } from "../shared/api/subscriptionApi";
import {
    formatRub,
    type TestPaymentOutcome,
    type TestPaymentResponse,
} from "../features/subscription/model/subscription.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

/** Stand-in for the payment provider's page until a real one (Robokassa / ЮKassa) is connected. */
export default function TestPaymentPage() {
    const navigate = useNavigate();
    const { paymentId } = useParams<{ paymentId: string }>();
    const id = Number(paymentId);

    const [payment, setPayment] = useState<TestPaymentResponse | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        subscriptionApi
            .getTestPayment(id)
            .then(setPayment)
            .catch((error: unknown) => {
                setErrorMessage(
                    axios.isAxiosError<ApiErrorResponse>(error)
                        ? error.response?.data?.message ?? "Платёж не найден"
                        : "Платёж не найден"
                );
            });
    }, [id]);

    const complete = async (outcome: TestPaymentOutcome) => {
        setBusy(true);
        try {
            await subscriptionApi.completeTestPayment(id, outcome);
            navigate(`/subscription?payment=${id}`, { replace: true });
        } catch {
            setErrorMessage("Не удалось завершить тестовую оплату");
            setBusy(false);
        }
    };

    return (
        <MobileShell title="Тестовая оплата" showTabBar={false}>
            <div className="fb-tab-panel fb-sub">
                <div className="fb-sub__test">Это тестовая страница вместо платёжного сервиса. Деньги не списываются.</div>

                {errorMessage && <div className="fb-cal-error">{errorMessage}</div>}

                {payment && (
                    <div className="fb-plan fb-plan--accent">
                        <div className="fb-plan__title">Подписка «{payment.planTitle}» на {payment.billingPeriod === "YEAR" ? "год" : "месяц"}</div>
                        <div className="fb-plan__price">{formatRub(payment.amountKopecks)}</div>
                        {payment.status !== "PENDING" ? (
                            <div className="fb-plan__hint">Платёж уже обработан.</div>
                        ) : (
                            <>
                                <button type="button" className="fb-btn fb-btn--primary" disabled={busy} onClick={() => void complete("PAY")}>
                                    Оплатить (карта сохранится)
                                </button>
                                <button type="button" className="fb-btn fb-btn--ghost" disabled={busy} onClick={() => void complete("PAY_FAILING_CARD")}>
                                    Оплатить картой, которая откажет при продлении
                                </button>
                                <button type="button" className="fb-btn fb-btn--ghost fb-btn--danger-text" disabled={busy} onClick={() => void complete("DECLINE")}>
                                    Отказ банка
                                </button>
                            </>
                        )}
                    </div>
                )}

                <button type="button" className="fb-add-link" onClick={() => navigate("/subscription")}>
                    Вернуться к подписке
                </button>
            </div>
        </MobileShell>
    );
}
