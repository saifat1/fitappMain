import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { publicApi } from "../shared/api/publicApi";
import { formatRub, type PublicPricingResponse } from "../features/subscription/model/subscription.types";

/**
 * Public «Тарифы и оплата» page (no sign-in). The payment provider requires the site to show:
 * description and prices of the service, how it is provided, refund terms, contacts and the
 * seller's details (самозанятый). Prices and details come from /api/public/pricing.
 */
export default function PricingPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<PublicPricingResponse | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        publicApi.getPricing().then(setData).catch(() => setFailed(true));
    }, []);

    const seller = data?.seller;
    const dash = (v: string | undefined) => (v && v.trim() ? v : "—");

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button type="button" className="fb-topbar__back" aria-label="Назад" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/welcome"))}>
                    ‹
                </button>
                <h1 className="fb-topbar__title">Тарифы и оплата</h1>
            </header>

            <div className="fb-body fb-sub">
                <div className="fb-doc-heading">Что такое «ФитАпп»</div>
                <p className="fb-doc-paragraph">
                    Онлайн-сервис для персональных тренеров: календарь тренировок, учёт клиентов и договоров (блоков тренировок),
                    онлайн-запись клиентов на свободные слоты, упражнения и подходы, круговые тренировки с таймером, зарплатный отчёт.
                    Работает в браузере на телефоне и компьютере. Клиенты тренера пользуются приложением бесплатно — платит только тренер.
                </p>

                <div className="fb-doc-heading">Тарифы</div>
                {failed && <div className="fb-cal-error">Не удалось загрузить тарифы, обновите страницу.</div>}
                {data?.plans.map((plan) => (
                    <div key={plan.code} className={`fb-plan ${plan.code === "PRO" ? "fb-plan--accent" : ""}`}>
                        <div className="fb-plan__title">{plan.title}</div>
                        <div className="fb-plan__price">
                            {plan.monthPriceKopecks === 0 ? "Бесплатно" : `${formatRub(plan.monthPriceKopecks)} / мес`}
                        </div>
                        {plan.yearPriceKopecks > 0 && <div className="fb-plan__hint">или {formatRub(plan.yearPriceKopecks)} за год</div>}
                        <div className="fb-plan__limit">
                            {plan.clientLimit == null ? "Клиентов без ограничений" : `До ${plan.clientLimit} активных клиентов`}
                        </div>
                    </div>
                ))}
                {data && (
                    <p className="fb-doc-paragraph">
                        Новому тренеру — {data.trialDays} дней тарифа Pro бесплатно, без привязки карты. Цены в рублях, НДС не облагается
                        (налог на профессиональный доход).
                    </p>
                )}

                <div className="fb-doc-heading">Как оплатить и получить доступ</div>
                <p className="fb-doc-paragraph">
                    1. Зарегистрируйтесь как тренер. 2. Откройте «Профиль» → «Подписка» и выберите тариф и период. 3. Оплатите банковской
                    картой на странице платёжного сервиса. Доступ по тарифу открывается сразу после оплаты, чек из «Мой налог» приходит на
                    электронную почту. Подписка продлевается автоматически; автопродление можно отключить в любой момент в разделе «Подписка».
                </p>

                <div className="fb-doc-heading">Отказ и возврат</div>
                <p className="fb-doc-paragraph">
                    От подписки можно отказаться в любой момент: возвращается стоимость неиспользованных дней оплаченного периода, ошибочное
                    списание — полностью. Напишите на {dash(seller?.email)}; срок рассмотрения — до 10 рабочих дней. Подробнее — в{" "}
                    <Link className="fb-doc-link" to="/legal/refund">Политике возврата</Link>.
                </p>

                <div className="fb-doc-heading">Документы</div>
                <div className="fb-doc-links">
                    <Link className="fb-doc-link" to="/legal/offer">Договор-оферта на подписку</Link>
                    <Link className="fb-doc-link" to="/legal/refund">Политика возврата</Link>
                    <Link className="fb-doc-link" to="/legal/terms">Пользовательское соглашение</Link>
                    <Link className="fb-doc-link" to="/legal/privacy">Политика обработки персональных данных</Link>
                </div>

                <div className="fb-doc-heading">Контакты и реквизиты</div>
                <div className="fb-sub-status">
                    <div className="fb-sub-status__title">{dash(seller?.name)}</div>
                    <div className="fb-sub-status__sub">{seller?.taxStatus ?? "Плательщик налога на профессиональный доход (самозанятый)"}</div>
                    <div className="fb-sub-status__usage">ИНН: {dash(seller?.inn)}</div>
                    <div className="fb-sub-status__usage">Эл. почта: {dash(seller?.email)}</div>
                    <div className="fb-sub-status__usage">Телефон: {dash(seller?.phone)}</div>
                    <div className="fb-sub-status__usage">Город: {dash(seller?.city)}</div>
                </div>
            </div>
        </div>
    );
}
