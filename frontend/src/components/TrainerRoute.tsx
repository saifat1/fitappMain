import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../features/auth/model/AuthContext";

type Props = {
    children: ReactNode;
};

export default function TrainerRoute({ children }: Props) {
    const { isInitializing, token, isAuthenticated, currentUser } = useAuth();

    if (isInitializing) {
        return <div>Загрузка...</div>;
    }

    if (!token || !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (currentUser?.role !== "TRAINER") {
        return <Navigate to="/me" replace />;
    }

    return <>{children}</>;
}