import { apiClient } from "./axios";
import type {
  BookingRequestResponse,
  CreateBookingRequest,
  ReviewBookingRequest,
} from "../../features/booking/model/booking.types";

export const bookingRequestApi = {
  async createMyBookingRequest(
      payload: CreateBookingRequest
  ): Promise<BookingRequestResponse> {
    const response = await apiClient.post("/client/booking-requests", payload);
    return response.data;
  },

  async getMyBookingRequests(): Promise<BookingRequestResponse[]> {
    const response = await apiClient.get("/client/booking-requests");
    return response.data;
  },

  async cancelMyBookingRequest(id: number): Promise<BookingRequestResponse> {
    const response = await apiClient.post(`/client/booking-requests/${id}/cancel`);
    return response.data;
  },

  async getTrainerBookingRequests(): Promise<BookingRequestResponse[]> {
    const response = await apiClient.get("/trainer/booking-requests");
    return response.data;
  },

  async approveBookingRequest(
      id: number,
      payload: ReviewBookingRequest
  ): Promise<BookingRequestResponse> {
    const response = await apiClient.post(
        `/trainer/booking-requests/${id}/approve`,
        payload
    );
    return response.data;
  },

  async declineBookingRequest(
      id: number,
      payload: ReviewBookingRequest
  ): Promise<BookingRequestResponse> {
    const response = await apiClient.post(
        `/trainer/booking-requests/${id}/decline`,
        payload
    );
    return response.data;
  },
};