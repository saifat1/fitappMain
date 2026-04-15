import { NavLink } from "react-router-dom";

const items = [
    { to: "/me", label: "Главная", icon: "⌂" },
    { to: "/trainings", label: "Трен.", icon: "🕒" },
    { to: "/trainer/clients", label: "Клиенты", icon: "👥", trainerOnly: true },
    { to: "/reschedule-requests", label: "Переносы", icon: "⇄" },
    { to: "/more", label: "Ещё", icon: "⋯" },
];

type Props = {
    isTrainer: boolean;
};

export default function MobileBottomNav({ isTrainer }: Props) {
    const visibleItems = items.filter((item) => !item.trainerOnly || isTrainer);

    return (
        <nav className="mobile-bottom-nav" aria-label="Мобильная навигация">
            {visibleItems.map((item) => (
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
        </nav>
    );
}