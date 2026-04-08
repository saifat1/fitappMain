import { Navigate, useParams } from "react-router-dom";
import RegisterByInviteForm from "../features/auth/ui/RegisterByInviteForm";
import { useAuth } from "../features/auth/model/AuthContext";

export default function RegisterByInvitePage() {
    const { token } = useParams();
    const { isAuthenticated, isInitializing } = useAuth();

    if (!token) {
        return (
            <div className="page-card">
                <h2>Некорректная ссылка</h2>
                <p>Токен приглашения отсутствует.</p>
            </div>
        );
    }

    if (!isInitializing && isAuthenticated) {
        return <Navigate to="/me" replace />;
    }

    return (
        <div className="page-card">
            <h2>Регистрация по приглашению</h2>
            <p className="page-description">
                Токен приглашения: <code>{token}</code>
            </p>

            <RegisterByInviteForm token={token} />
        </div>
    );
}