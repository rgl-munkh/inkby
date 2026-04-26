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
};
