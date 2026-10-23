import { useNavigate } from "react-router-dom";

import MobileShell from "../widgets/MobileShell";
import Avatar from "../shared/ui/Avatar";
import { useAuth } from "../features/auth/model/AuthContext";
import { avatarColor, getInitials } from "../features/calendar/lib/calendarWeek";

type Row = { label: string; sub?: string; to: string };

const DATA_ROWS: Row[] = [
    { label: "Информация о здоровье", sub: "Заполняет тренер", to: "/client/questionnaire" },
    { label: "Измерения", to: "/client/measurements" },
    { label: "Запросы на перенос", to: "/reschedule-requests" },
    { label: "Предложить идею / Сообщить о проблеме", sub: "Чего не хватает или что работает не так", to: "/feedback" },
];

const DOC_ROWS: Row[] = [
    { label: "Пользовательское соглашение", to: "/legal/terms" },
    { label: "Политика конфиденциальности", to: "/legal/privacy" },
];

export default function ClientProfilePage() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    if (!currentUser) {
        return null;
    }

    const fullName =
        [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ").trim() || currentUser.email;

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const renderRows = (rows: Row[]) => (
        <div className="fb-list">
            {rows.map((row) => (
                <button key={row.to} type="button" className="fb-row fb-row--button" onClick={() => navigate(row.to)}>
                    <span className="fb-row__main">
                        <span className="fb-row__title">{row.label}</span>
                        {row.sub ? <span className="fb-row__sub">{row.sub}</span> : null}
                    </span>
                    <span className="fb-row__chevron">›</span>
                </button>
            ))}
        </div>
    );

    return (
        <MobileShell title="Профиль">
            <div className="fb-profile-hero">
                <Avatar
                    initials={getInitials(currentUser.firstName, currentUser.lastName, currentUser.email[0]?.toUpperCase() ?? "?")}
                    color={avatarColor(currentUser.id)}
                    size="lg"
                />
                <div className="fb-profile-hero__name">{fullName}</div>
                <div className="fb-profile-hero__email">{currentUser.email}</div>
            </div>

            <div className="fb-tab-panel">
                <div className="fb-section-title">Мои данные</div>
                {renderRows(DATA_ROWS)}

                <div className="fb-section-title">Документы</div>
                {renderRows(DOC_ROWS)}
            </div>

            <button type="button" className="fb-btn fb-btn--ghost fb-logout" onClick={handleLogout}>
                Выйти
            </button>

            <button type="button" className="fb-delete-link" onClick={() => navigate("/account/delete")}>
                Удалить аккаунт
            </button>
        </MobileShell>
    );
}
