import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

type Tab = {
    to: string;
    label: string;
    icon: ReactNode;
    end?: boolean;
};

function Icon({ children }: { children: ReactNode }) {
    return (
        <svg
            className="fb-tab__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const TABS: Tab[] = [
    {
        to: "/me",
        label: "Календарь",
        end: true,
        icon: (
            <Icon>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M3 9h18M8 2v4M16 2v4" />
            </Icon>
        ),
    },
    {
        to: "/trainer/clients",
        label: "Клиенты",
        icon: (
            <Icon>
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
                <path d="M16 4a3 3 0 0 1 0 6M21 20c0-2.5-1.5-4.3-4-4.8" />
            </Icon>
        ),
    },
    {
        to: "/exercise-templates",
        label: "Упражнения",
        icon: (
            <Icon>
                <path d="M4 9v6M20 9v6M6 7v10M18 7v10M6 12h12" />
            </Icon>
        ),
    },
    {
        to: "/trainer/profile",
        label: "Профиль",
        icon: (
            <Icon>
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" />
            </Icon>
        ),
    },
];

export default function AppTabBar() {
    return (
        <nav className="fb-tabbar">
            {TABS.map((tab) => (
                <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.end}
                    className={({ isActive }) => `fb-tab ${isActive ? "is-active" : ""}`}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
