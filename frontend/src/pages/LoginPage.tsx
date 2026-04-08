import { Navigate } from "react-router-dom";
import LoginForm from "../features/auth/ui/LoginForm";
import { useAuth } from "../features/auth/model/AuthContext";

export default function LoginPage() {
    const { isAuthenticated, isInitializing } = useAuth();

    if (!isInitializing && isAuthenticated) {
        return <Navigate to="/me" replace />;
    }

    return (
        <div className="page-card">
            <h2>Вход</h2>
            <p className="page-description">
                Войди как тренер или как уже зарегистрированный клиент.
            </p>

            <LoginForm />
        </div>
    );
}