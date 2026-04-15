import type { TrainingResponse } from "../model/training.types";

type Props = {
    training: TrainingResponse;
    isTrainer: boolean;
    isProcessing?: boolean;
    onOpen: (id: number) => void;
    onComplete?: (id: number) => void;
    onCancel?: (id: number) => void;
};

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
        <div
            className="training-card"
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
            <div className="training-card-main">
                <div className="training-title">
                    {training.trainingDate} {training.startTime ?? ""}
                </div>

                <div className="training-client">
                    {fullName || training.clientEmail || `Клиент #${training.clientId}`}
                </div>

                <div className={statusClassName}>{training.status}</div>
            </div>

            {canManageTraining && (
                <div className="training-card-actions">
                    <button
                        type="button"
                        className="btn btn-success"
                        disabled={isProcessing}
                        onClick={(e) => {
                            e.stopPropagation();
                            onComplete?.(training.id);
                        }}
                    >
                        {isProcessing ? "Обновляем..." : "Завершить"}
                    </button>

                    <button
                        type="button"
                        className="btn btn-danger"
                        disabled={isProcessing}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCancel?.(training.id);
                        }}
                    >
                        {isProcessing ? "Обновляем..." : "Отменить"}
                    </button>
                </div>
            )}
        </div>
    );
}