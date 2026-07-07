export type ClientContractResponse = {
    id: number;
    contractNumber: string | null;
    totalTrainings: number;
    remainingTrainings: number;
    usedTrainings: number;
    createdAt: string;
};

export type CreateClientContractRequest = {
    contractNumber?: string;
    totalTrainings: number;
};

export type AddTrainingsToContractRequest = {
    count: number;
};
