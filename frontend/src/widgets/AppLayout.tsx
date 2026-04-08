import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/model/AuthContext";

type Props = {
    children: ReactNode;
};

export default function AppLayout({ children }: Props) {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const isTrainer = currentUser?.role === "TRAINER";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <div>
                    <h1 className="app-title">FitApp</h1>
                    <p className="app-subtitle">Этап 3 — тренировки</p>
                </div>

                {currentUser && (
                    <div className="app-user-panel">
                        <div>{currentUser.email}</div>
                        <div>{currentUser.role}</div>
                        <button onClick={handleLogout}>Выйти</button>
                    </div>
                )}
            </header>

            <div className="app-body">
                <aside className="app-sidebar">
                    <nav className="side-nav">
                        <NavLink
                            to="/me"
                            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        >
                            Профиль
                        </NavLink>

                        <NavLink
                            to="/trainings"
                            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        >
                            Тренировки
                        </NavLink>
                        <NavLink
                            to="/reschedule-requests"
                            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        >
                            Переносы
                        </NavLink>

                        {isTrainer && (
                            <>
                                <NavLink
                                    to="/trainer/clients"
                                    className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                >
                                    Клиенты
                                </NavLink>

                                <NavLink
                                    to="/trainer/invites"
                                    className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                                >
                                    Приглашения
                                </NavLink>
                            </>
                        )}
                    </nav>
                </aside>

                <main className="app-main">{children}</main>
            </div>
        </div>
    );
}