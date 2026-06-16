import { useState } from "react";
import Avatar from "../../../shared/ui/Avatar";

export type CalendarMode = "planning" | "schedule";

const MODE_LABEL: Record<CalendarMode, string> = {
    planning: "Планирование",
    schedule: "Расписание",
};

type Props = {
    mode: CalendarMode;
    onModeChange: (mode: CalendarMode) => void;
    avatarInitials: string;
    avatarColor: string;
    onAvatarClick?: () => void;
};

export default function CalendarHeader({
    mode,
    onModeChange,
    avatarInitials,
    avatarColor,
    onAvatarClick,
}: Props) {
    const [open, setOpen] = useState(false);

    const select = (next: CalendarMode) => {
        onModeChange(next);
        setOpen(false);
    };

    return (
        <header className="fb-cal-header">
            <button
                type="button"
                className="fb-mode-switch"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                {MODE_LABEL[mode]}
                <span
                    className={`fb-mode-switch__chevron ${open ? "fb-mode-switch__chevron--open" : ""}`}
                >
                    ▾
                </span>
            </button>

            <button
                type="button"
                className="fb-cal-header__avatar"
                onClick={onAvatarClick}
                aria-label="Профиль"
            >
                <Avatar initials={avatarInitials} color={avatarColor} size="md" />
            </button>

            {open && (
                <>
                    <button
                        type="button"
                        className="fb-overlay"
                        aria-label="Закрыть меню"
                        onClick={() => setOpen(false)}
                    />
                    <div className="fb-mode-menu" role="menu">
                        {(Object.keys(MODE_LABEL) as CalendarMode[]).map((value) => (
                            <button
                                key={value}
                                type="button"
                                role="menuitem"
                                className={`fb-mode-menu__item ${mode === value ? "fb-mode-menu__item--active" : ""}`}
                                onClick={() => select(value)}
                            >
                                {MODE_LABEL[value]}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </header>
    );
}
