import { apiClient } from "./axios";
import type {
    CreateTrainerDutySlotRequest,
    TrainerDutySlotResponse,
} from "../../features/duty-slot/model/dutySlot.types";

export const dutySlotApi = {
    async getMyDutySlots(from: string, to: string): Promise<TrainerDutySlotResponse[]> {
        const response = await apiClient.get("/trainer/duty-slots", {
            params: { from, to },
        });

        return response.data;
    },

    async createMyDutySlot(
        payload: CreateTrainerDutySlotRequest
    ): Promise<TrainerDutySlotResponse> {
        const response = await apiClient.post("/trainer/duty-slots", payload);
        return response.data;
    },

    async deleteMyDutySlot(id: number): Promise<void> {
        await apiClient.delete(`/trainer/duty-slots/${id}`);
    },
};