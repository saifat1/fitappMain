export type BookingRequestStatus =
    | "PENDING"
    | "APPROVED"
    | "DECLINED"
    | "CANCELLED";

export type BookingRequestResponse = {
  id: number;
  trainerId: number;
  clientId: number;
  clientEmail?: string | null;
  clientFirstName?: string | null;
  clientLastName?: string | null;
  requestedStart: string;
  requestedEnd: string;
  status: BookingRequestStatus;
  clientComment?: string | null;
  trainerComment?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
};

export type CreateBookingRequest = {
  trainerId: number;
  requestedStart: string;
  requestedEnd: string;
  clientComment?: string;
};

export type ReviewBookingRequest = {
  trainerComment?: string;
};