import { apiClient } from "./axios";
import type { ClientTrainerResponse } from "../../features/clienttrainer/model/clienttrainer.types";

export const clientTrainerApi = {
  async getMyTrainers(): Promise<ClientTrainerResponse[]> {
    const response = await apiClient.get("/client/trainers");
    return response.data;
  },
};
