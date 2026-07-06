import type { ReactNode } from "react";
import AppTabBar from "../widgets/AppTabBar";

type Props = {
    /** Simple centered title header. Ignored if `header` is provided. */
    title?: string;
    /** Optional control rendered at the left of the default title header (e.g. a back button). */
    left?: ReactNode;
    /** Optional control rendered at the right of the default title header. */
    right?: ReactNode;
    /** Fully custom header (e.g. the calendar mode switcher). Overrides `title`. */
    header?: ReactNode;
    /** Floating action button (rendered above the tab bar). */
    fab?: ReactNode;
    /** Extra classes for the scrollable content area. */
    contentClassName?: string;
    /** Set to false for drill-in screens (e.g. notifications) that aren't a main tab. */
    showTabBar?: boolean;
    children: ReactNode;
};

export default function MobileShell({
    title,
    left,
    right,
    header,
    fab,
    contentClassName = "",
    showTabBar = true,
    children,
}: Props) {
    return (
        <div className="fb-app">
            {header ??
                (title ? (
                    <header className="fb-topbar fb-topbar--shell">
                        {left ? <div className="fb-topbar__left">{left}</div> : null}
                        <h1 className="fb-topbar__title">{title}</h1>
                        {right ? <div className="fb-topbar__right">{right}</div> : null}
                    </header>
                ) : null)}

            <div className={`fb-app__content ${contentClassName}`.trim()}>{children}</div>

            {fab}

            {showTabBar ? <AppTabBar /> : null}
        </div>
    );
}
