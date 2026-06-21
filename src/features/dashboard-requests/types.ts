export type Photo = { id: string; photoUrl: string };

export type Schedule = {
  id: string;
  privateNote: string | null;
  message: string | null;
  lowAmount: string;
  highAmount: string;
  durationMinutes: number;
  suggestedDatetime: string | null;
};

export type Appointment = {
  id: string;
  status: string;
  chosenDatetime: string | null;
  rescheduleCount: number;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
};

export type BookingRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ideaDescription: string;
  tattooSize: string;
  placement: string;
  status: string;
  createdAt: string;
  photos: Photo[];
  schedules: Schedule[];
  appointment: Appointment | null;
};

export type ScheduleSheetBookingRequest = Pick<
  BookingRequest,
  "id" | "firstName" | "lastName" | "tattooSize" | "placement" | "photos"
>;

export type AvailableDateEntry = {
  date: string;
  startTime: string;
  endTime: string;
};
