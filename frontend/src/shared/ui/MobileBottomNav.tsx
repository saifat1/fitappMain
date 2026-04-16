import { NavLink } from "react-router-dom";

type Props = {
    isTrainer: boolean;
};

type NavItem = {
    to: string;
    label: string;
    icon: string;
    trainerOnly?: boolean;
};

export default function MobileBottomNav({ isTrainer }: Props) {
    const items: NavItem[] = isTrainer
        ? [
            { to: "/me", label: "Главная", icon: "⌂" },
            { to: "/trainings", label: "Трен.", icon: "◦" },
            { to: "/trainer/clients", label: "Клиенты", icon: "◦" },
            { to: "/reschedule-requests", label: "Переносы", icon: "⇄" },
            { to: "/exercise-templates", label: "Шаблоны", icon: "◦" },
        ]
        : [
            { to: "/me", label: "Главная", icon: "⌂" },
            { to: "/trainings", label: "Трен.", icon: "◦" },
            { to: "/reschedule-requests", label: "Переносы", icon: "⇄" },
            { to: "/more", label: "Ещё", icon: "⋯" },
        ];

    const visibleItems = items.filter((item) => !item.trainerOnly || isTrainer);

    return (
        <nav className="mobile-bottom-nav">
            {visibleItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        `mobile-bottom-nav__item ${isActive ? "is-active" : ""}`
                    }
                >
                    <span className="mobile-bottom-nav__icon">{item.icon}</span>
                    <span className="mobile-bottom-nav__label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}