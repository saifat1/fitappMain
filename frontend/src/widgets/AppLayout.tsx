import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/model/AuthContext";
import MobileBottomNav from "../shared/ui/MobileBottomNav";

type Props = {
    children: ReactNode;
};

function getUserDisplayName(
    email?: string,
    firstName?: string | null,
    lastName?: string | null
) {
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    return fullName || email || "Пользователь";
}

function getInitials(
    email?: string,
    firstName?: string | null,
    lastName?: string | null
) {
    const first = firstName?.[0] ?? "";
    const last = lastName?.[0] ?? "";
    const initials = `${first}${last}`.trim().toUpperCase();

    if (initials) {
        return initials;
    }

    return email?.[0]?.toUpperCase() ?? "U";
}

function getNavClassName(isActive: boolean) {
    return isActive ? "nav-link nav-link-active" : "nav-link";
}

function getPageTitle(pathname: string, isTrainer: boolean): string {
    if (pathname === "/me") {
        return isTrainer ? "Календарь" : "Профиль";
    }

    if (pathname === "/trainer/profile") return "Профиль";
    if (pathname.startsWith("/trainings/")) return "Тренировка";
    if (pathname === "/trainings") return "Тренировки";
    if (pathname === "/reschedule-requests") return "Переносы";
    if (pathname === "/exercise-templates") return "Шаблоны";
    if (pathname === "/trainer/clients") return "Клиенты";
    if (pathname === "/trainer/invites") return "Приглашения";
    if (pathname === "/trainer/availability") return "Доступность";
    if (pathname === "/trainer/booking-requests") return "Запросы на запись";
    if (pathname === "/analytics") return "Аналитика";
    if (pathname === "/client/booking") return "Запись";
    if (pathname.startsWith("/client-history")) return "История тренировок";

    return "FitApp";
}

export default function AppLayout({ children }: Props) {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isTrainer = currentUser?.role === "TRAINER";
    const isAdmin = Boolean(currentUser?.admin);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const displayName = getUserDisplayName(
        currentUser?.email,
        currentUser?.firstName,
        currentUser?.lastName
    );

    const initials = getInitials(
        currentUser?.email,
        currentUser?.firstName,
        currentUser?.lastName
    );

    const pageTitle = getPageTitle(location.pathname, isTrainer);

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand-card">
                    <div className="brand-logo">F</div>
                    <div>
                        <div className="brand-title">FitApp</div>
                        <div className="brand-subtitle">Тренировки и сопровождение</div>
                    </div>
                </div>

                {currentUser && (
                    <div className="user-card">
                        <div className="user-avatar">{initials}</div>

                        <div className="user-name">{displayName}</div>
                        <div className="user-email">{currentUser.email}</div>

                        <div className="user-meta">
                            <span>Роль</span>
                            <strong>
                                {isTrainer ? "Тренер" : "Клиент"}
                                {isAdmin ? " · Админ" : ""}
                            </strong>
                        </div>
                    </div>
                )}

                <nav className="nav-list">
                    <NavLink to="/me" className={({ isActive }) => getNavClassName(isActive)}>
                        ◦ {isTrainer ? "Календарь" : "Профиль"}
                    </NavLink>

                    {isTrainer && (
                        <NavLink
                            to="/trainer/profile"
                            className={({ isActive }) => getNavClassName(isActive)}
                        >
                            ◦ Профиль
                        </NavLink>
                    )}

                    <NavLink
                        to="/trainings"
                        className={({ isActive }) => getNavClassName(isActive)}
                    >
                        ◦ Тренировки
                    </NavLink>

                    <NavLink
                        to="/reschedule-requests"
                        className={({ isActive }) => getNavClassName(isActive)}
                    >
                        ◦ Переносы
                    </NavLink>

                    {!isTrainer && (
                        <NavLink
                            to="/client/booking"
                            className={({ isActive }) => getNavClassName(isActive)}
                        >
                            ◦ Запись
                        </NavLink>
                    )}

                    {isTrainer && (
                        <>
                            <NavLink
                                to="/exercise-templates"
                                className={({ isActive }) => getNavClassName(isActive)}
                            >
                                ◦ Шаблоны
                            </NavLink>

                            <NavLink
                                to="/trainer/clients"
                                className={({ isActive }) => getNavClassName(isActive)}
                            >
                                ◦ Клиенты
                            </NavLink>

                            <NavLink
                                to="/trainer/invites"
                                className={({ isActive }) => getNavClassName(isActive)}
                            >
                                ◦ Приглашения
                            </NavLink>

                            <NavLink
                                to="/trainer/availability"
                                className={({ isActive }) => getNavClassName(isActive)}
                            >
                                ◦ Доступность
                            </NavLink>

                            <NavLink
                                to="/trainer/booking-requests"
                                className={({ isActive }) => getNavClassName(isActive)}
                            >
                                ◦ Запросы на запись
                            </NavLink>
                        </>
                    )}
                    {isAdmin && (
                        <NavLink
                            to="/analytics"
                            className={({ isActive }) => getNavClassName(isActive)}
                        >
                            ◦ Аналитика
                        </NavLink>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary"
                        onClick={handleLogout}
                    >
                        Выйти
                    </button>
                </div>
            </aside>

            <div className="main-shell">
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="workspace-kicker">Рабочее пространство</div>
                        <h1 className="workspace-title">{pageTitle}</h1>
                    </div>

                    <div className="topbar-actions">
                        {currentUser && (
                            <button
                                type="button"
                                className="topbar-user-card"
                                onClick={() => {
                                    if (isTrainer) {
                                        navigate("/trainer/profile");
                                    }
                                }}
                            >
                                <div className="topbar-user-avatar">{initials}</div>

                                <div className="topbar-user-info">
                                    <div className="topbar-user-name">{displayName}</div>
                                    <div className="topbar-user-email">{currentUser.email}</div>
                                </div>
                            </button>
                        )}

                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary topbar-logout-btn"
                            onClick={handleLogout}
                        >
                            Выйти
                        </button>
                    </div>
                </header>

                <main className="main-content">{children}</main>
            </div>

            <MobileBottomNav isTrainer={isTrainer} isAdmin={isAdmin} />        </div>
    );
}