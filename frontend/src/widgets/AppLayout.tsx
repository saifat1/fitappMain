import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

    if (initials) return initials;
    return email?.[0]?.toUpperCase() ?? "U";
}

export default function AppLayout({ children }: Props) {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const isTrainer = currentUser?.role === "TRAINER";

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

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="app-sidebar-top">
                    <div className="app-brand">
                        <div className="app-brand-mark">F</div>
                        <div>
                            <div className="app-brand-title">FitApp</div>
                            <div className="app-brand-subtitle">Тренировки и сопровождение</div>
                        </div>
                    </div>

                    {currentUser && (
                        <div className="app-sidebar-user-card">
                            <div className="app-sidebar-user-top">
                                <div className="app-sidebar-avatar">{initials}</div>
                                <div className="app-sidebar-user-meta">
                                    <div className="app-sidebar-user-name">{displayName}</div>
                                    <div className="app-sidebar-user-email">{currentUser.email}</div>
                                </div>
                            </div>

                            <div className="app-sidebar-role-row">
                                <span>Роль</span>
                                <strong>{isTrainer ? "Тренер" : currentUser.role}</strong>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="side-nav">
                    <NavLink
                        to="/me"
                        className={({ isActive }) =>
                            isActive ? "nav-link nav-link-active" : "nav-link"
                        }
                    >
                        <span className="nav-link-icon">◦</span>
                        <span>Профиль</span>
                    </NavLink>

                    <NavLink
                        to="/trainings"
                        className={({ isActive }) =>
                            isActive ? "nav-link nav-link-active" : "nav-link"
                        }
                    >
                        <span className="nav-link-icon">◦</span>
                        <span>Тренировки</span>
                    </NavLink>

                    <NavLink
                        to="/reschedule-requests"
                        className={({ isActive }) =>
                            isActive ? "nav-link nav-link-active" : "nav-link"
                        }
                    >
                        <span className="nav-link-icon">◦</span>
                        <span>Переносы</span>
                    </NavLink>

                    {isTrainer && (
                        <>
                            <NavLink
                                to="/exercise-templates"
                                className={({ isActive }) =>
                                    isActive ? "nav-link nav-link-active" : "nav-link"
                                }
                            >
                                <span className="nav-link-icon">◦</span>
                                <span>Шаблоны</span>
                            </NavLink>

                            <NavLink
                                to="/trainer/clients"
                                className={({ isActive }) =>
                                    isActive ? "nav-link nav-link-active" : "nav-link"
                                }
                            >
                                <span className="nav-link-icon">◦</span>
                                <span>Клиенты</span>
                            </NavLink>

                            <NavLink
                                to="/trainer/invites"
                                className={({ isActive }) =>
                                    isActive ? "nav-link nav-link-active" : "nav-link"
                                }
                            >
                                <span className="nav-link-icon">◦</span>
                                <span>Приглашения</span>
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="app-sidebar-bottom">
                    <button
                        type="button"
                        className="dashboard-btn dashboard-btn-secondary app-logout-btn"
                        onClick={handleLogout}
                    >
                        Выйти
                    </button>
                </div>
            </aside>

            <div className="app-content-shell">
                <header className="app-topbar">
                    <div>
                        <div className="app-topbar-kicker">Рабочее пространство</div>
                        <h1 className="app-topbar-title">FitApp</h1>
                    </div>

                    <div className="app-topbar-actions">
                        {currentUser && (
                            <div className="app-topbar-user-pill">
                                <span>{currentUser.email}</span>
                                <strong>{isTrainer ? "Тренер" : currentUser.role}</strong>
                            </div>
                        )}

                        <button
                            type="button"
                            className="dashboard-btn dashboard-btn-secondary app-topbar-logout-btn"
                            onClick={handleLogout}
                        >
                            Выйти
                        </button>
                    </div>
                </header>

                <main className="app-main">
                    <div className="app-page-container">{children}</div>
                </main>

                <MobileBottomNav isTrainer={isTrainer} />
            </div>
        </div>
    );
}