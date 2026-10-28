import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/model/AuthContext";
import { isClientDevice } from "../shared/lib/clientDevice";

/**
 * Корневой маршрут "/".
 * Авторизованных пользователей сразу пускаем в приложение (/me),
 * неавторизованных — на экран приветствия с выбором "Войти" / "Зарегистрироваться" (/welcome),
 * а на устройстве клиента (FIT-83) — сразу на вход: регистрация только для тренеров.
 */
export default function RootRedirect() {
    const { isAuthenticated, isInitializing } = useAuth();

    if (isInitializing) {
        return <div>Загрузка...</div>;
    }

    if (isAuthenticated) return <Navigate to="/me" replace />;
    return <Navigate to={isClientDevice() ? "/login" : "/welcome"} replace />;
}
