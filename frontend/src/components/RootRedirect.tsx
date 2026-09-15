import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/model/AuthContext";

/**
 * Корневой маршрут "/".
 * Авторизованных пользователей сразу пускаем в приложение (/me),
 * неавторизованных — на экран приветствия с выбором "Войти" / "Зарегистрироваться" (/welcome).
 */
export default function RootRedirect() {
    const { isAuthenticated, isInitializing } = useAuth();

    if (isInitializing) {
        return <div>Загрузка...</div>;
    }

    return <Navigate to={isAuthenticated ? "/me" : "/welcome"} replace />;
}
