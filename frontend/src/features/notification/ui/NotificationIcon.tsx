import PersonIcon from "./PersonIcon";
import RequestPlusIcon from "./RequestPlusIcon";
import CancelCrossIcon from "./CancelCrossIcon";
import { NOTIFICATION_KIND_STYLE } from "../lib/notificationDisplay";
import type { NotificationKind } from "../model/notification.types";

type Props = {
    kind: NotificationKind;
};

export default function NotificationIcon({ kind }: Props) {
    const style = NOTIFICATION_KIND_STYLE[kind];

    return (
        <span
            className="fb-notif__icon"
            style={{ background: style.bg, color: style.fg }}
        >
            {kind === "NEW_CLIENT" && <PersonIcon />}
            {kind === "REQUEST" && <RequestPlusIcon />}
            {kind === "CANCELLATION" && <CancelCrossIcon />}
        </span>
    );
}
