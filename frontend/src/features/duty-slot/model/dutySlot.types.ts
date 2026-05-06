export type TrainerDutySlotResponse = {
    id: number;
    dutyDate: string;
    startTime: string;
    endTime: string;
};

export type CreateTrainerDutySlotRequest = {
    dutyDate: string;
    startTime: string;
    endTime: string;
};