import type { TrainingResponse } from "../model/training.types";

type Props = {
    training: TrainingResponse;
    isTrainer: boolean;
    isProcessing?: boolean;
    onOpen: (id: number) => void;
    onComplete?: (id: number) => void;
    onCancel?: (id: number) => void;
};

function getStatusLabel(status: string): string {
    switch (status) {
        case "PLANNED":
            return "Запланирована";
        case "COMPLETED":
            return "Завершена";
        case "CANCELLED":
            return "Отменена";
        default:
            return status;
    }
}

export default function TrainingCard({
                                         training,
                                         isTrainer,
                                         isProcessing = false,
                                         onOpen,
                                         onComplete,
                                         onCancel,
                                     }: Props) {
    const fullName = [training.clientFirstName, training.clientLastName]
        .filter(Boolean)
        .join(" ");

    const canManageTraining =
        isTrainer &&
        training.status !== "COMPLETED" &&
        training.status !== "CANCELLED";

    const statusClassName = `training-status training-status--${training.status.toLowerCase()}`;

    return (
        <article
            className="training-card training-card-compact"
            onClick={() => onOpen(training.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpen(training.id);
                }
            }}
        >
            <div className="training-card-row">
                <div className="training-card-time-block">
                    <div className="training-card-time">
                        {training.startTime ?? "—"}
                        {training.endTime ? `–${training.endTime}` : ""}
                    </div>
                    <div className="training-card-date">{training.trainingDate}</div>
                </div>

                <div className="training-card-content">
                    <div className="training-card-client">
                        {fullName || training.clientEmail || `Клиент #${training.clientId}`}
                    </div>

                    {training.trainerNote && (
                        <div className="training-card-note">{training.trainerNote}</div>
                    )}
                </div>

                <div className="training-card-side">
                    <div className={statusClassName}>{getStatusLabel(training.status)}</div>

                    <div className="training-card-actions">
                        {canManageTraining && (
                            <>
                                <button
                                    type="button"
                                    className="card-action-btn card-action-btn-success"
                                    disabled={isProcessing}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onComplete?.(training.id);
                                    }}
                                >
                                    {isProcessing ? "..." : "✓"}
                                </button>

                                <button
                                    type="button"
                                    className="card-action-btn card-action-btn-danger"
                                    disabled={isProcessing}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCancel?.(training.id);
                                    }}
                                >
                                    {isProcessing ? "..." : "×"}
                                </button>
                            </>
                        )}

                        <button
                            type="button"
                            className="card-action-btn card-action-btn-neutral"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpen(training.id);
                            }}
                        >
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}