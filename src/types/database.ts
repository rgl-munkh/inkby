// Types are inferred from the Drizzle schema — single source of truth.
// Import directly from "@/lib/db/schema" in application code.
export type {
  Artist,
  ArtistInsert,
  BookingRequest,
  BookingRequestInsert,
  BookingRequestPhoto,
  BookingRequestPhotoInsert,
  BookingSchedule,
  BookingScheduleInsert,
  Appointment,
  AppointmentInsert,
  FlashDeal,
  FlashDealInsert,
  FlashDealSize,
  FlashDealSizeInsert,
  Payment,
  PaymentInsert,
} from "@/lib/db/schema";
