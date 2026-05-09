import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

type Props = {
    isTrainer: boolean;
};

type NavItem = {
    to: string;
    label: string;
    icon: string;
};

export default function MobileBottomNav({ isTrainer }: Props) {
    const location = useLocation();
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    const items: NavItem[] = useMemo(
        () =>
            isTrainer
                ? [
                    { to: "/me", label: "Календ.", icon: "⌂" },
                    { to: "/trainer/profile", label: "Профиль", icon: "◦" },
                    { to: "/trainings", label: "Трен.", icon: "◦" },
                    { to: "/reschedule-requests", label: "Переносы", icon: "⇄" },
                    { to: "/exercise-templates", label: "Шаблоны", icon: "◦" },
                    { to: "/trainer/clients", label: "Клиенты", icon: "◦" },
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
                ],
        [isTrainer]
    );

    const storageKey = isTrainer
        ? "fitapp.mobile-nav.scroll.trainer"
        : "fitapp.mobile-nav.scroll.client";

    useLayoutEffect(() => {
        const node = scrollerRef.current;
        if (!node) return;

        const raw = sessionStorage.getItem(storageKey);
        if (!raw) return;

        const value = Number(raw);
        if (!Number.isFinite(value)) return;

        requestAnimationFrame(() => {
            node.scrollLeft = value;
        });
    }, [location.pathname, storageKey]);

    useEffect(() => {
        const node = scrollerRef.current;
        if (!node) return;

        const handleScroll = () => {
            sessionStorage.setItem(storageKey, String(node.scrollLeft));
        };

        handleScroll();
        node.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            node.removeEventListener("scroll", handleScroll);
        };
    }, [storageKey]);

    return (
        <div ref={scrollerRef} className="mobile-bottom-nav">
            {items.map((item) => (
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
        </div>
    );
}