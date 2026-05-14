import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/model/AuthContext";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
    const { isAuthenticated, isInitializing, token, requiresConsent } = useAuth();
    const location = useLocation();

    if (isInitializing) {
        return <div>Загрузка...</div>;
    }

    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (
        requiresConsent &&
        location.pathname !== "/legal/consents" &&
        !location.pathname.startsWith("/legal/")
    ) {
        return <Navigate to="/legal/consents" replace />;
    }

    return <>{children}</>;
}