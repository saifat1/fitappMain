import { apiClient } from "./axios";
import type {
  TrainerAvailabilityCalendarResponse,
  TrainerAvailabilityException,
  TrainerAvailabilityRulesResponse,
  UpdateTrainerAvailabilityRequest,
} from "../../features/availability/model/availability.types";

export const availabilityApi = {
  async getTrainerAvailability(
      trainerId: number,
      from: string,
      to: string
  ): Promise<TrainerAvailabilityCalendarResponse> {
    const response = await apiClient.get(
        `/client/trainers/${trainerId}/availability`,
        {
          params: { from, to },
        }
    );
    return response.data;
  },

  async getMyAvailabilityRules(): Promise<TrainerAvailabilityRulesResponse> {
    const response = await apiClient.get("/trainer/availability-rules");
    return response.data;
  },

  async updateMyAvailabilityRules(
      payload: UpdateTrainerAvailabilityRequest
  ): Promise<TrainerAvailabilityRulesResponse> {
    const response = await apiClient.put("/trainer/availability-rules", payload);
    return response.data;
  },

  async addMyException(payload: TrainerAvailabilityException): Promise<TrainerAvailabilityException> {
    const response = await apiClient.post("/trainer/availability-exceptions", payload);
    return response.data;
  },

  async deleteMyException(id: number): Promise<void> {
    await apiClient.delete(`/trainer/availability-exceptions/${id}`);
  },
};