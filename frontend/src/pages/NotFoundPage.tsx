import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="fb-screen">
            <div className="fb-not-found">
                <div className="fb-not-found__icon" aria-hidden="true">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-3.5-3.5" />
                        <path d="M8.5 11h5" />
                    </svg>
                </div>
                <div className="fb-not-found__code">404</div>
                <h1 className="fb-not-found__title">Страница не найдена</h1>
                <p className="fb-not-found__text">Возможно, ссылка устарела или страница была удалена.</p>
                <button type="button" className="fb-btn fb-btn--primary" onClick={() => navigate("/", { replace: true })}>
                    На главную
                </button>
            </div>
        </div>
    );
}
