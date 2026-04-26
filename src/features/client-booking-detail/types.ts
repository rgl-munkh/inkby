export type Artist = {
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  instagramUsername: string | null;
};

export type Schedule = {
  id: string;
  durationMinutes: number;
  suggestedDatetime: string | null;
  lowAmount: string;
  highAmount: string;
  message: string | null;
  createdAt: string;
};

export type Appointment = {
  id: string;
  status: string;
};

export type BookingRequest = {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  photos: { photoUrl: string }[];
  schedules: Schedule[];
  appointment: Appointment | null;
  artist: Artist;
};

export type QPayInvoice = {
  invoice_id: string;
  qr_image: string;
  qr_text: string;
  urls: Array<{ name: string; description?: string; logo?: string; link: string }>;
  amount: number;
};
