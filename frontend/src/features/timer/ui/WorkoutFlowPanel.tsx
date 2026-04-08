type Props = {
    currentIndex: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
};

export default function WorkoutFlowPanel({
                                             currentIndex,
                                             total,
                                             onPrev,
                                             onNext,
                                         }: Props) {
    if (total === 0) {
        return null;
    }

    const isFirst = currentIndex <= 0;
    const isLast = currentIndex >= total - 1;

    return (
        <div className="workout-flow-panel">
            <div className="workout-flow-title">
                <strong>Текущее упражнение</strong>
                <span>
          {currentIndex + 1} / {total}
        </span>
            </div>

            <div className="workout-flow-actions">
                <button type="button" onClick={onPrev} disabled={isFirst}>
                    Предыдущее
                </button>

                <button type="button" onClick={onNext} disabled={isLast}>
                    Следующее
                </button>
            </div>
        </div>
    );
}