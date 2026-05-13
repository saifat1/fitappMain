import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/model/AuthContext";

type Props = {
    children: ReactNode;
};

export default function AdminRoute({ children }: Props) {
    const { isInitializing, token, isAuthenticated, currentUser } = useAuth();

    if (isInitializing) {
        return <p>Загрузка...</p>;
    }

    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!currentUser?.admin) {
        return <Navigate to="/me" replace />;
    }

    return <>{children}</>;
}