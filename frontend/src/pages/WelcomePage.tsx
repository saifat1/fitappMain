import { useNavigate } from "react-router-dom";
import BrandWordmark from "../shared/ui/BrandWordmark";

/**
 * Onboarding / splash screen (mockup images 1 & 2, first frame).
 *
 * Frog asset: export the 3D frog from Figma and save it as
 * `frontend/public/fitapp-hero.png`. Until then a fallback block shows.
 */
export default function WelcomePage() {
    const navigate = useNavigate();

    return (
        <div className="fb-welcome">
            <div className="fb-welcome__hero">
                <BrandWordmark className="fb-welcome__wordmark" color="#ffffff" />

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
        </div>
    );
}
