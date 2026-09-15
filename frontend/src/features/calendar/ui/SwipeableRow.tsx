import { useRef, useState, type PointerEvent, type ReactNode } from "react";

export type SwipeAction = {
    key: string;
    label: string;
    color: "red" | "green";
    icon: ReactNode;
    onClick: () => void;
};

type Props = {
    actions: SwipeAction[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
};

const ACTION_WIDTH = 58;
const OPEN_THRESHOLD_RATIO = 0.4;

export default function SwipeableRow({ actions, isOpen, onOpenChange, children }: Props) {
    const maxReveal = actions.length * ACTION_WIDTH;

    const [dragX, setDragX] = useState(isOpen ? -maxReveal : 0);
    const [isDragging, setIsDragging] = useState(false);
    const pointerId = useRef<number | null>(null);
    const startClientX = useRef(0);
    const startDragX = useRef(0);
    const movedFar = useRef(false);

    // Another row opened elsewhere, or a click closed this one — snap shut.
    // Adjusting state during render (React's documented pattern for syncing
    // local state to a prop) instead of an effect avoids an extra render pass.
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        setDragX(isOpen ? -maxReveal : 0);
    }

    if (actions.length === 0) {
        return <div className="fb-swipe-row">{children}</div>;
    }

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        pointerId.current = event.pointerId;
        startClientX.current = event.clientX;
        startDragX.current = dragX;
        movedFar.current = false;
        setIsDragging(true);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (pointerId.current !== event.pointerId) return;
        const delta = event.clientX - startClientX.current;
        if (Math.abs(delta) > 8) {
            movedFar.current = true;
        }
        const next = Math.min(0, Math.max(-maxReveal, startDragX.current + delta));
        setDragX(next);
    };

    const endDrag = (event: PointerEvent<HTMLDivElement>) => {
        if (pointerId.current !== event.pointerId) return;
        pointerId.current = null;
        setIsDragging(false);

        const shouldOpen = dragX < -maxReveal * OPEN_THRESHOLD_RATIO;
        setDragX(shouldOpen ? -maxReveal : 0);
        onOpenChange(shouldOpen);
    };

    return (
        <div className="fb-swipe-row">
            <div className="fb-swipe-row__actions" style={{ width: maxReveal }}>
                {actions.map((action) => (
                    <button
                        key={action.key}
                        type="button"
                        className="fb-swipe-row__action"
                        onClick={() => {
                            onOpenChange(false);
                            action.onClick();
                        }}
                    >
                        <span className={`fb-swipe-row__action-icon fb-swipe-row__action-icon--${action.color}`}>
                            {action.icon}
                        </span>
                        <span className="fb-swipe-row__action-label">{action.label}</span>
                    </button>
                ))}
            </div>

            <div
                className="fb-swipe-row__content"
                style={{
                    transform: `translateX(${dragX}px)`,
                    transition: isDragging ? "none" : "transform 0.2s ease",
                    touchAction: "pan-y",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClickCapture={(event) => {
                    // A swipe that moved past the tap threshold shouldn't also
                    // trigger the row's own onClick (e.g. opening the training).
                    if (movedFar.current) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }}
            >
                {children}
            </div>
        </div>
    );
}
