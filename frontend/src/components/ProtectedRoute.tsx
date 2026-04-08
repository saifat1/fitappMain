import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/model/AuthContext";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
    const { isAuthenticated, isInitializing, token } = useAuth();

    if (isInitializing) {
        return <div>Загрузка...</div>;
    }

    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}