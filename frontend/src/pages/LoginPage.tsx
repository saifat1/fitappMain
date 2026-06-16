import { Navigate, useNavigate } from "react-router-dom";
import LoginForm from "../features/auth/ui/LoginForm";
import { useAuth } from "../features/auth/model/AuthContext";

export default function LoginPage() {
    const { isAuthenticated, isInitializing } = useAuth();
    const navigate = useNavigate();

    if (!isInitializing && isAuthenticated) {
        return <Navigate to="/me" replace />;
    }

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <button
                    type="button"
                    className="fb-topbar__back"
                    aria-label="Назад"
                    onClick={() => navigate("/welcome")}
                >
                    ‹
                </button>
                <h1 className="fb-topbar__title">Вход</h1>
            </header>

            <LoginForm />
        </div>
    );
}
