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
            <div className="fb-screen">
                <header className="fb-topbar">
                    <h1 className="fb-topbar__title">Некорректная ссылка</h1>
                </header>
                <div className="fb-body">
                    <div className="fb-cal-error">Токен приглашения отсутствует.</div>
                </div>
            </div>
        );
    }

    if (!isInitializing && isAuthenticated) {
        return <Navigate to="/me" replace />;
    }

    if (isInviteLoading) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <h1 className="fb-topbar__title">Регистрация по приглашению</h1>
                </header>
                <div className="fb-cal-status">Загрузка данных приглашения…</div>
            </div>
        );
    }

    if (inviteError) {
        return (
            <div className="fb-screen">
                <header className="fb-topbar">
                    <h1 className="fb-topbar__title">Регистрация по приглашению</h1>
                </header>
                <div className="fb-body">
                    <div className="fb-cal-error">{inviteError}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fb-screen">
            <header className="fb-topbar">
                <h1 className="fb-topbar__title">Регистрация по приглашению</h1>
            </header>
            <RegisterByInviteForm token={token} initialEmail={inviteEmail} />
        </div>
    );
}
