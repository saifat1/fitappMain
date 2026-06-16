import Avatar from "../../../shared/ui/Avatar";
import { getInitials, avatarColor } from "../../calendar/lib/calendarWeek";
import type { TrainerClientResponse } from "../../trainer/model/trainer.types";

type Props = {
    clients: TrainerClientResponse[];
    selectedId: number | null;
    onSelect: (clientId: number) => void;
    onClose: () => void;
};

function clientName(client: TrainerClientResponse): string {
    const full = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
    return full || client.email;
}

export default function ClientPickerSheet({ clients, selectedId, onSelect, onClose }: Props) {
    return (
        <>
            <button type="button" className="fb-sheet-backdrop" aria-label="Закрыть" onClick={onClose} />
            <div className="fb-sheet" role="dialog" aria-label="Клиент">
                <div className="fb-sheet__title">Клиенты</div>

                {clients.length === 0 ? (
                    <div className="fb-empty">Клиентов пока нет</div>
                ) : (
                    <div className="fb-sheet__scroll">
                        {clients.map((client) => {
                            const active = client.id === selectedId;
                            return (
                                <button
                                    key={client.id}
                                    type="button"
                                    className="fb-row fb-row--button"
                                    onClick={() => {
                                        onSelect(client.id);
                                        onClose();
                                    }}
                                >
                                    <Avatar
                                        initials={getInitials(client.firstName, client.lastName, client.email[0]?.toUpperCase() ?? "K")}
                                        color={avatarColor(client.id)}
                                        size="sm"
                                    />
                                    <span className="fb-row__main">
                                        <span className="fb-row__title">{clientName(client)}</span>
                                    </span>
                                    <span className={`fb-row__radio ${active ? "fb-row__radio--checked" : ""}`}>
                                        {active ? "✓" : ""}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
