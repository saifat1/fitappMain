import { NavLink } from "react-router-dom";

type Props = {
    isTrainer: boolean;
};

type NavItem = {
    to: string;
    label: string;
    icon: string;
};

export default function MobileBottomNav({ isTrainer }: Props) {
    const items: NavItem[] = isTrainer
        ? [
            { to: "/me", label: "Главная", icon: "⌂" },
            { to: "/trainings", label: "Трен.", icon: "◦" },
            { to: "/trainer/clients", label: "Клиенты", icon: "◦" },
            { to: "/reschedule-requests", label: "Переносы", icon: "⇄" },
            { to: "/exercise-templates", label: "Шаблоны", icon: "◦" },
            { to: "/trainer/invites", label: "Инвайты", icon: "+" },
            { to: "/trainer/availability", label: "Доступн.", icon: "◦" },
            { to: "/trainer/booking-requests", label: "Запросы", icon: "◦" },
        ]
        : [
            { to: "/me", label: "Главная", icon: "⌂" },
            { to: "/trainings", label: "Трен.", icon: "◦" },
            { to: "/reschedule-requests", label: "Переносы", icon: "⇄" },
            { to: "/client/booking", label: "Запись", icon: "+" },
            { to: "/more", label: "Ещё", icon: "⋯" },
        ];

    return (
        <nav className="mobile-bottom-nav" aria-label="Мобильная навигация">
            <div className="mobile-bottom-nav__scroller">
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `mobile-bottom-nav__item ${isActive ? "is-active" : ""}`
                        }
                    >
            <span className="mobile-bottom-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
                        <span className="mobile-bottom-nav__label">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}