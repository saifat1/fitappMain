import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import RegisterByInviteForm from "../features/auth/ui/RegisterByInviteForm";
import { useAuth } from "../features/auth/model/AuthContext";
import { authApi } from "../shared/api/authApi";

export default function RegisterByInvitePage() {
    const { token } = useParams();
    const { isAuthenticated, isInitializing } = useAuth();

    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviteLoading, setIsInviteLoading] = useState(true);
    const [inviteError, setInviteError] = useState("");

    useEffect(() => {
        if (!token) {
            setIsInviteLoading(false);
            return;
        }

        const loadInvite = async () => {
            try {
                const response = await authApi.getInviteDetails(token);
                setInviteEmail(response.email ?? "");
            } catch {
                setInviteError("Не удалось загрузить данные приглашения");
            } finally {
                setIsInviteLoading(false);
            }
        };

        void loadInvite();
    }, [token]);

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

    if (isInviteLoading) {
        return (
            <div className="page-card">
                <h2>Регистрация по приглашению</h2>
                <p>Загрузка данных приглашения...</p>
            </div>
        );
    }

    if (inviteError) {
        return (
            <div className="page-card">
                <h2>Регистрация по приглашению</h2>
                <p>{inviteError}</p>
            </div>
        );
    }

    return (
        <div className="page-card">
            <h2>Регистрация по приглашению</h2>
            <RegisterByInviteForm token={token} initialEmail={inviteEmail} />
        </div>
    );
}