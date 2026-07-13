export type ClientContractResponse = {
    id: number;
    contractNumber: string | null;
    totalTrainings: number;
    remainingTrainings: number;
    usedTrainings: number;
    endDate: string | null;
    createdAt: string;
};

export type CreateClientContractRequest = {
    contractNumber?: string;
    totalTrainings: number;
    endDate?: string;
};

export type AddTrainingsToContractRequest = {
    count: number;
};
