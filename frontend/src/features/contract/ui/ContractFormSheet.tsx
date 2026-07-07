import { useState } from "react";

type Props = {
    mode: "create" | "add-trainings";
    isSaving: boolean;
    errorMessage?: string;
    onSubmitCreate?: (contractNumber: string, totalTrainings: number) => void;
    onSubmitAddTrainings?: (count: number) => void;
    onClose: () => void;
};

export default function ContractFormSheet({
    mode,
    isSaving,
    errorMessage,
    onSubmitCreate,
    onSubmitAddTrainings,
    onClose,
}: Props) {
    const [contractNumber, setContractNumber] = useState("");
    const [totalTrainings, setTotalTrainings] = useState("");
    const [count, setCount] = useState("");

    const handleSubmit = () => {
        if (mode === "create") {
            const total = Number(totalTrainings);
            if (!total || total < 1) return;
            onSubmitCreate?.(contractNumber.trim(), total);
        } else {
            const value = Number(count);
            if (!value || value < 1) return;
            onSubmitAddTrainings?.(value);
        }
    };

    return (
        <>
            <button type="button" className="fb-overlay" aria-label="Закрыть" onClick={onClose} />

            <div className="fb-add-sheet" role="dialog" aria-label="Договор">
                <div className="fb-add-sheet__handle" />

                <h3 className="fb-add-sheet__title">
                    {mode === "create" ? "Новый договор" : "Добавить тренировки"}
                </h3>

                {mode === "create" ? (
                    <>
                        <div className="fb-add-sheet__row">
                            <label className="fb-add-sheet__label" htmlFor="contract-number">
                                Номер договора
                            </label>
                            <input
                                id="contract-number"
                                type="text"
                                className="fb-add-sheet__select"
                                style={{ width: "auto", maxWidth: "none", flex: 1 }}
                                placeholder="Необязательно"
                                value={contractNumber}
                                onChange={(event) => setContractNumber(event.target.value)}
                            />
                        </div>

                        <div className="fb-add-sheet__row">
                            <label className="fb-add-sheet__label" htmlFor="contract-total">
                                Кол-во оплаченных тренировок
                            </label>
                            <input
                                id="contract-total"
                                type="number"
                                min={1}
                                className="fb-add-sheet__select"
                                value={totalTrainings}
                                onChange={(event) => setTotalTrainings(event.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="fb-add-sheet__row">
                        <label className="fb-add-sheet__label" htmlFor="contract-add-count">
                            Сколько тренировок добавить
                        </label>
                        <input
                            id="contract-add-count"
                            type="number"
                            min={1}
                            className="fb-add-sheet__select"
                            value={count}
                            onChange={(event) => setCount(event.target.value)}
                        />
                    </div>
                )}

                {errorMessage ? <div className="fb-cal-error">{errorMessage}</div> : null}

                <div className="fb-add-sheet__actions">
                    <button
                        type="button"
                        className="fb-btn fb-btn--ghost"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        className="fb-btn fb-btn--primary"
                        onClick={handleSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? "Сохраняем…" : "Сохранить"}
                    </button>
                </div>
            </div>
        </>
    );
}
