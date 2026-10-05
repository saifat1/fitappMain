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
  /** Set when the request reschedules an existing training. */
  originalTrainingId?: number | null;
  originalTrainingDate?: string | null;
  originalStartTime?: string | null;
  originalEndTime?: string | null;
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
  originalTrainingId?: number;
  requestedStart: string;
  requestedEnd: string;
  clientComment?: string;
};

export type ReviewBookingRequest = {
  trainerComment?: string;
};