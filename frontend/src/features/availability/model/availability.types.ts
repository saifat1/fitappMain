export type AvailabilitySlotStatus = "FREE" | "BUSY" | "PAST";

export type AvailabilitySlot = {
  start: string;
  end: string;
  status: AvailabilitySlotStatus;
};

export type TrainerAvailabilityCalendarResponse = {
  trainerId: number;
  from: string;
  to: string;
  slots: AvailabilitySlot[];
};

export type TrainerAvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  active: boolean;
};

export type TrainerAvailabilityException = {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  comment?: string | null;
};

export type TrainerAvailabilityRulesResponse = {
  rules: TrainerAvailabilityRule[];
  exceptions: TrainerAvailabilityException[];
};

export type UpdateTrainerAvailabilityRequest = {
  rules: TrainerAvailabilityRule[];
  exceptions: TrainerAvailabilityException[];
};