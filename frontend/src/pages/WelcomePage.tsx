import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import BrandWordmark from "../shared/ui/BrandWordmark";
import { publicApi } from "../shared/api/publicApi";
import type { SellerInfo } from "../features/subscription/model/subscription.types";
import { isClientDevice } from "../shared/lib/clientDevice";

/**
 * Onboarding / splash screen (mockup images 1 & 2, first frame).
 *
 * Frog asset: export the 3D frog from Figma and save it as
 * `frontend/public/fitapp-hero.png`. Until then a fallback block shows.
 */
export default function WelcomePage() {
    const navigate = useNavigate();
    // Seller details in the footer are required by the payment provider (самозанятый: ФИО, ИНН, город).
    const [seller, setSeller] = useState<SellerInfo | null>(null);

    useEffect(() => {
        publicApi.getPricing().then((data) => setSeller(data.seller)).catch(() => undefined);
    }, []);

    // FIT-83: a client device goes straight to the login — the start screen leads to the trainer registration.
    if (isClientDevice()) {
        return <Navigate to="/login" replace />;
    }

    const sellerLine = seller?.name
        ? [seller.name, "самозанятый", seller.inn ? `ИНН ${seller.inn}` : "", seller.city ? `г. ${seller.city}` : ""]
              .filter(Boolean)
              .join(" · ")
        : "";

    return (
        <div className="fb-welcome">
            <div className="fb-welcome__hero">
                <BrandWordmark className="fb-welcome__wordmark" color="#ffffff" />
                <div className="fb-welcome__tagline">Все тренировки в одном месте</div>

                <img
                    className="fb-welcome__frog"
                    src="/fitapp-hero.png"
                    alt="FitApp"
                    onError={(event) => {
                        const img = event.currentTarget;
                        img.style.display = "none";
                        img.nextElementSibling?.classList.remove("fb-hidden");
                    }}
                />
                <div className="fb-welcome__frog-fallback fb-hidden">
                    Положите изображение лягушки в&nbsp;public/fitapp-hero.png
                </div>
            </div>

            <div className="fb-welcome__actions">
                {/* Регистрация по email требует нового бэкенд-флоу.
                    Пока ведём на существующую регистрацию тренера. */}
                <button
                    type="button"
                    className="fb-btn fb-btn--ghost"
                    onClick={() => navigate("/trainer/register")}
                >
                    Зарегистрироваться
                </button>

                <button
                    type="button"
                    className="fb-link fb-link--muted"
                    onClick={() => navigate("/login")}
                >
                    Войти
                </button>
            </div>

            <nav className="fb-welcome__legal" aria-label="Информация">
                <Link to="/pricing">Тарифы и оплата</Link>
                <Link to="/legal/offer">Оферта</Link>
                <Link to="/legal/refund">Возврат</Link>
                <Link to="/legal/privacy">Персональные данные</Link>
                <Link to="/pricing">Контакты</Link>
            </nav>

            {sellerLine ? (
                <div className="fb-welcome__seller">
                    {sellerLine}
                    {seller?.email ? <> · <a href={`mailto:${seller.email}`}>{seller.email}</a></> : null}
                    {seller?.phone ? <> · <a href={`tel:${seller.phone.replace(/[^+d]/g, "")}`}>{seller.phone}</a></> : null}
                </div>
            ) : null}
        </div>
    );
}
