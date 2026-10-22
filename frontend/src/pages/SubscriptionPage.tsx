import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import MobileShell from "../widgets/MobileShell";
import { subscriptionApi } from "../shared/api/subscriptionApi";
import {
    formatRub,
    type BillingPeriod,
    type PlanCode,
    type PlanResponse,
    type SubscriptionResponse,
} from "../features/subscription/model/subscription.types";
import type { ApiErrorResponse } from "../features/auth/model/auth.types";

function resolveApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function date(value: string | null): string {
    return value ? new Date(value).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "—";
}

const PLAN_FEATURES: Record<PlanCode, string[]> = {
    FREE: ["Все функции приложения", "Бесплатное приложение для клиентов"],
    PRO: ["Календарь, договоры и запись на слоты", "Круговые и шаблоны упражнений", "Зарплатный отчёт"],
    UNLIMITED: ["Всё, что в Pro", "Без ограничения по клиентам"],
};

function clientsLabel(limit: number | null): string {
    return limit == null ? "Клиентов без ограничений" : `До ${limit} активных клиентов`;
}

/** Monthly-equivalent saving of the yearly price, e.g. 29. */
function yearSavingPercent(plan: PlanResponse): number {
    if (!plan.monthPriceKopecks) return 0;
    return Math.round((1 - plan.yearPriceKopecks / (plan.monthPriceKopecks * 12)) * 100);
}

export default function SubscriptionPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnedPaymentId = Number(searchParams.get("payment")) || null;

    const [data, setData] = useState<SubscriptionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [period, setPeriod] = useState<BillingPeriod>("MONTH");
    const [busy, setBusy] = useState<string | null>(null);
    const [selection, setSelection] = useState<number[] | null>(null);

    const load = useCallback(async () => {
        try {
            const next = await subscriptionApi.getCurrent();
            setData(next);
            if (next.billingPeriod) setPeriod(next.billingPeriod);
        } catch (error) {
            setErrorMessage(resolveApiError(error, "Не удалось загрузить подписку"));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const run = async (key: string, action: () => Promise<SubscriptionResponse | void>, fallback: string) => {
        setBusy(key);
        setErrorMessage("");
        try {
            const next = await action();
            if (next) setData(next);
        } catch (error) {
            setErrorMessage(resolveApiError(error, fallback));
        } finally {
            setBusy(null);
        }
    };

    const pay = (plan: PlanCode) =>
        run(`pay-${plan}`, async () => {
            const { confirmationUrl } = await subscriptionApi.checkout(plan, period);
            // Provider's page (or our test page) — a full redirect, the provider sends the trainer back.
            window.location.assign(confirmationUrl);
        }, "Не удалось перейти к оплате");

    const returned = useMemo(
        () => (returnedPaymentId && data ? data.payments.find((p) => p.id === returnedPaymentId) ?? null : null),
        [returnedPaymentId, data]
    );

    const back = (
        <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => navigate(-1)}>‹</button>
    );

    if (isLoading) {
        return (
            <MobileShell title="Подписка" left={back} showTabBar={false}>
                <div className="fb-empty">Загрузка…</div>
            </MobileShell>
        );
    }

    if (!data) {
        return (
            <MobileShell title="Подписка" left={back} showTabBar={false}>
                <div className="fb-cal-error">{errorMessage || "Подписка недоступна"}</div>
            </MobileShell>
        );
    }

    const isPaidActive = data.status === "ACTIVE" || data.status === "GRACE";
    const selected = selection ?? data.clients.filter((c) => c.workable).map((c) => c.clientId);

    return (
        <MobileShell title="Подписка" left={back} showTabBar={false}>
            <div className="fb-tab-panel fb-sub">
                {data.testMode && (
                    <div className="fb-sub__test">Тестовый режим: оплата проходит на тестовой странице, деньги не списываются.</div>
                )}

                {returned?.status === "SUCCEEDED" && <div className="fb-success-note">Оплата прошла, подписка продлена.</div>}
                {returned?.status === "FAILED" && (
                    <div className="fb-cal-error">Оплата не прошла{returned.failureReason ? `: ${returned.failureReason}` : ""}. Попробуйте ещё раз.</div>
                )}

                {!data.enabled ? (
                    <div className="fb-sub-status">
                        <div className="fb-sub-status__title">Оплата подписки скоро появится</div>
                        <div className="fb-sub-status__sub">Сейчас все функции доступны бесплатно. Ниже — будущие тарифы.</div>
                    </div>
                ) : (
                    <StatusCard data={data} busy={busy} onAutoRenew={(v) => run("auto", () => subscriptionApi.setAutoRenew(v), "Не удалось изменить автопродление")} />
                )}

                {data.enabled && data.overLimit && data.clientLimit != null && (
                    <div className="fb-sub-limit">
                        <div className="fb-sub-limit__title">Клиентов больше, чем позволяет тариф</div>
                        <div className="fb-sub-limit__sub">
                            Выберите до {data.clientLimit} рабочих клиентов. С остальными можно смотреть историю и договоры, но не создавать
                            тренировки и записи. Ничего не удаляется — после оплаты всё вернётся.
                        </div>
                        {data.clients.map((c) => {
                            const checked = selected.includes(c.clientId);
                            const disabled = !checked && selected.length >= data.clientLimit!;
                            return (
                                <label key={c.clientId} className={`fb-sub-limit__row ${disabled ? "fb-sub-limit__row--disabled" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={disabled}
                                        onChange={() =>
                                            setSelection(checked ? selected.filter((id) => id !== c.clientId) : [...selected, c.clientId])
                                        }
                                    />
                                    <span>{c.name}</span>
                                    {c.workable && <span className="fb-pill fb-pill--ok">рабочий</span>}
                                </label>
                            );
                        })}
                        {selection && (
                            <button
                                type="button"
                                className="fb-btn fb-btn--primary"
                                disabled={busy === "clients"}
                                onClick={() =>
                                    void run("clients", async () => {
                                        const next = await subscriptionApi.selectWorkableClients(selected);
                                        setSelection(null);
                                        return next;
                                    }, "Не удалось сохранить выбор")
                                }
                            >
                                Сохранить выбор
                            </button>
                        )}
                    </div>
                )}

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                <div className="fb-section-title fb-section-title--flush">Тарифы</div>

                <div className="fb-segment fb-sub__period">
                    <button type="button" className={`fb-segment__item ${period === "MONTH" ? "fb-segment__item--active" : ""}`} onClick={() => setPeriod("MONTH")}>
                        Помесячно
                    </button>
                    <button type="button" className={`fb-segment__item ${period === "YEAR" ? "fb-segment__item--active" : ""}`} onClick={() => setPeriod("YEAR")}>
                        На год{data.plans[1] ? ` · −${yearSavingPercent(data.plans[1])}%` : ""}
                    </button>
                </div>

                {data.plans.map((plan) => {
                    const isCurrent = data.enabled && data.plan === plan.code && (plan.code === "FREE" ? data.status === "FREE" : isPaidActive);
                    const price = period === "YEAR" ? plan.yearPriceKopecks : plan.monthPriceKopecks;
                    const renewSame = isCurrent && data.billingPeriod === period;
                    return (
                        <div key={plan.code} className={`fb-plan ${plan.code === "PRO" ? "fb-plan--accent" : ""}`}>
                            <div className="fb-plan__head">
                                <span className="fb-plan__title">{plan.title}</span>
                                {plan.code === "PRO" && <span className="fb-pill fb-pill--ok">популярный</span>}
                                {isCurrent && <span className="fb-pill fb-pill--muted">текущий</span>}
                            </div>
                            <div className="fb-plan__price">
                                {price === 0 ? "Бесплатно" : formatRub(price)}
                                {price > 0 && <span className="fb-plan__per"> / {period === "YEAR" ? "год" : "мес"}</span>}
                            </div>
                            {period === "YEAR" && price > 0 && (
                                <div className="fb-plan__hint">≈ {formatRub(Math.round(price / 12))} в месяц</div>
                            )}
                            <div className="fb-plan__limit">{clientsLabel(plan.clientLimit)}</div>
                            <ul className="fb-plan__features">
                                {PLAN_FEATURES[plan.code].map((f) => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                            {data.enabled && price > 0 && (
                                <button
                                    type="button"
                                    className={`fb-btn ${plan.code === "PRO" ? "fb-btn--primary" : "fb-btn--ghost"}`}
                                    disabled={busy !== null}
                                    onClick={() => void pay(plan.code)}
                                >
                                    {busy === `pay-${plan.code}` ? "Переходим к оплате…" : renewSame ? "Продлить заранее" : isCurrent ? "Сменить период" : `Перейти на ${plan.title}`}
                                </button>
                            )}
                        </div>
                    );
                })}

                <div className="fb-sub__note">
                    Платит только тренер — клиенты пользуются приложением бесплатно. Оплата картой, чек придёт на почту.
                    При смене тарифа неиспользованные дни пересчитываются в новый тариф. Автопродление можно отключить в любой момент.
                    {data.enabled && (
                        <>
                            {" "}Переходя к оплате, вы принимаете <Link to="/legal/offer">договор-оферту</Link> и соглашаетесь на
                            автоматическое продление подписки. <Link to="/legal/refund">Политика возврата</Link>.
                        </>
                    )}
                </div>

                {data.enabled && data.payments.length > 0 && (
                    <>
                        <div className="fb-section-title fb-section-title--flush">История оплат</div>
                        <div className="fb-list">
                            {data.payments.map((p) => (
                                <div key={p.id} className="fb-row">
                                    <span className="fb-row__main">
                                        <span className="fb-row__title">
                                            {formatRub(p.amountKopecks)} · {data.plans.find((x) => x.code === p.plan)?.title ?? p.plan}, {p.billingPeriod === "YEAR" ? "год" : "месяц"}
                                        </span>
                                        <span className="fb-row__sub">
                                            {date(p.paidAt ?? p.createdAt)} · {p.purpose === "RENEWAL" ? "автопродление" : "оплата"}
                                            {p.failureReason ? ` · ${p.failureReason}` : ""}
                                        </span>
                                    </span>
                                    <span className={`fb-pill ${p.status === "SUCCEEDED" ? "fb-pill--ok" : p.status === "FAILED" ? "fb-pill--danger" : "fb-pill--muted"}`}>
                                        {p.status === "SUCCEEDED" ? "оплачено" : p.status === "FAILED" ? "отказ" : "в обработке"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {data.testMode && (
                    <div className="fb-sub__test">
                        <div>Тест: сдвинуть окончание пробного / оплаченного периода</div>
                        <div className="fb-sub__test-actions">
                            <button type="button" className="fb-timer__btn" disabled={busy !== null} onClick={() => void run("shift0", () => subscriptionApi.shiftForTest(0), "Не удалось")}>
                                Закончился сейчас
                            </button>
                            <button type="button" className="fb-timer__btn" disabled={busy !== null} onClick={() => void run("shift4", () => subscriptionApi.shiftForTest(4), "Не удалось")}>
                                4 дня назад (после отсрочки)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MobileShell>
    );
}

function StatusCard({
    data,
    busy,
    onAutoRenew,
}: {
    data: SubscriptionResponse;
    busy: string | null;
    onAutoRenew: (enabled: boolean) => void;
}) {
    let title = data.planTitle ?? "";
    let sub = "";
    let warn = false;

    switch (data.status) {
        case "TRIAL":
            title = `${data.planTitle} · пробный период`;
            sub = `Бесплатно до ${date(data.trialEndsAt)}. Потом — тариф «Старт» (до 3 клиентов), если не оплатить.`;
            break;
        case "ACTIVE":
            sub = data.autoRenew
                ? `Оплачено до ${date(data.paidUntil)}, дальше продлится автоматически`
                : `Оплачено до ${date(data.paidUntil)}. Автопродление выключено`;
            break;
        case "GRACE":
            warn = true;
            sub = `Не удалось списать оплату. Всё работает до ${date(data.graceUntil)} — мы попробуем ещё раз. Можно оплатить вручную ниже.`;
            break;
        default:
            title = "Старт · бесплатно";
            sub = "До 3 активных клиентов. Перейдите на Pro, чтобы вести больше.";
    }

    const canToggle = (data.status === "ACTIVE" || data.status === "GRACE") && data.paymentMethodTitle != null;

    return (
        <div className={`fb-sub-status ${warn ? "fb-sub-status--warn" : ""}`}>
            <div className="fb-sub-status__title">{title}</div>
            <div className="fb-sub-status__sub">{sub}</div>
            <div className="fb-sub-status__usage">
                Клиентов: {data.activeClients}
                {data.clientLimit != null ? ` из ${data.clientLimit}` : ""}
            </div>
            {data.paymentMethodTitle && <div className="fb-sub-status__usage">{data.paymentMethodTitle}</div>}
            {canToggle && (
                <label className="fb-sub-status__toggle">
                    <span>Автопродление</span>
                    <input
                        type="checkbox"
                        className="fb-switch"
                        checked={data.autoRenew}
                        disabled={busy === "auto"}
                        onChange={(e) => onAutoRenew(e.target.checked)}
                    />
                </label>
            )}
        </div>
    );
}
