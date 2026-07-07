import { useEffect, useState } from "react";
import { clientContractApi } from "../../../shared/api/clientContractApi";
import ContractFormSheet from "./ContractFormSheet";
import type { ClientContractResponse } from "../model/contract.types";

type Props = {
    clientId: number;
    onBalanceChange?: () => void;
};

type SheetState = { mode: "create" } | { mode: "add-trainings"; contractId: number } | null;

export default function ClientContractsSection({ clientId, onBalanceChange }: Props) {
    const [contracts, setContracts] = useState<ClientContractResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sheet, setSheet] = useState<SheetState>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await clientContractApi.getContracts(clientId);
            setContracts(data);
        } catch {
            // The client profile still works without this section loading.
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId]);

    const totalRemaining = contracts.reduce((sum, c) => sum + c.remainingTrainings, 0);

    const closeSheet = () => {
        setSheet(null);
        setErrorMessage("");
    };

    const handleCreate = async (contractNumber: string, totalTrainings: number) => {
        setIsSaving(true);
        setErrorMessage("");
        try {
            await clientContractApi.createContract(clientId, {
                contractNumber: contractNumber || undefined,
                totalTrainings,
            });
            closeSheet();
            await load();
            onBalanceChange?.();
        } catch {
            setErrorMessage("Не удалось создать договор");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddTrainings = async (count: number) => {
        if (sheet?.mode !== "add-trainings") return;
        setIsSaving(true);
        setErrorMessage("");
        try {
            await clientContractApi.addTrainings(clientId, sheet.contractId, { count });
            closeSheet();
            await load();
            onBalanceChange?.();
        } catch {
            setErrorMessage("Не удалось добавить тренировки");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fb-contracts">
            <div className="fb-section-title fb-section-title--flush">Тренировки по договору</div>

            {isLoading ? (
                <div className="fb-cal-status">Загрузка…</div>
            ) : contracts.length === 0 ? (
                <div className="fb-empty">Договор пока не оформлен</div>
            ) : (
                <>
                    <div className="fb-contracts__summary">
                        Осталось тренировок: <strong>{totalRemaining}</strong>
                    </div>

                    <div className="fb-list">
                        {contracts.map((contract) => (
                            <div key={contract.id} className="fb-row fb-contracts__row">
                                <span className="fb-row__main">
                                    <span className="fb-row__title">
                                        {contract.contractNumber ? `Договор № ${contract.contractNumber}` : "Договор без номера"}
                                    </span>
                                    <span className="fb-row__sub">
                                        {contract.remainingTrainings} из {contract.totalTrainings} осталось
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    className="fb-contracts__add-btn"
                                    onClick={() => setSheet({ mode: "add-trainings", contractId: contract.id })}
                                >
                                    + тренировки
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <button type="button" className="fb-add-link" onClick={() => setSheet({ mode: "create" })}>
                + Добавить договор
            </button>

            {sheet ? (
                <ContractFormSheet
                    mode={sheet.mode}
                    isSaving={isSaving}
                    errorMessage={errorMessage || undefined}
                    onSubmitCreate={handleCreate}
                    onSubmitAddTrainings={handleAddTrainings}
                    onClose={closeSheet}
                />
            ) : null}
        </div>
    );
}
