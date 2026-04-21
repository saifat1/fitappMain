import { apiClient } from "./axios";
import type {
  TrainerAvailabilityCalendarResponse,
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
};