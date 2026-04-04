import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const bookingRequestStatusEnum = pgEnum("booking_request_status", [
  "pending",
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending_payment",
  "paid",
  "completed",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const artists = pgTable("artists", {
  id: uuid("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  displayName: text("display_name"),
  instagramUsername: text("instagram_username"),
  depositAmount: numeric("deposit_amount", { precision: 12, scale: 2 }),
  studioLocation: text("studio_location"),
  studioLat: doublePrecision("studio_lat"),
  studioLng: doublePrecision("studio_lng"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookingRequests = pgTable("booking_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  artistId: uuid("artist_id")
    .references(() => artists.id, { onDelete: "cascade" })
    .notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  ideaDescription: text("idea_description").notNull(),
  tattooSize: text("tattoo_size").notNull(),
  placement: text("placement").notNull(),
  status: bookingRequestStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookingRequestPhotos = pgTable("booking_request_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingRequestId: uuid("booking_request_id")
    .references(() => bookingRequests.id, { onDelete: "cascade" })
    .notNull(),
  photoUrl: text("photo_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookingSchedules = pgTable("booking_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingRequestId: uuid("booking_request_id")
    .references(() => bookingRequests.id, { onDelete: "cascade" })
    .notNull(),
  artistId: uuid("artist_id")
    .references(() => artists.id, { onDelete: "cascade" })
    .notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  suggestedDatetime: timestamp("suggested_datetime", { withTimezone: true }).notNull(),
  lowAmount: numeric("low_amount", { precision: 12, scale: 2 }).notNull(),
  highAmount: numeric("high_amount", { precision: 12, scale: 2 }).notNull(),
  message: text("message"),
  privateNote: text("private_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingRequestId: uuid("booking_request_id")
    .references(() => bookingRequests.id, { onDelete: "cascade" })
    .notNull(),
  scheduleId: uuid("schedule_id")
    .references(() => bookingSchedules.id, { onDelete: "cascade" })
    .notNull(),
  artistId: uuid("artist_id")
    .references(() => artists.id, { onDelete: "cascade" })
    .notNull(),
  chosenDatetime: timestamp("chosen_datetime", { withTimezone: true }).notNull(),
  status: appointmentStatusEnum("status").default("pending_payment").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const flashDeals = pgTable("flash_deals", {
  id: uuid("id").defaultRandom().primaryKey(),
  artistId: uuid("artist_id")
    .references(() => artists.id, { onDelete: "cascade" })
    .notNull(),
  photoUrl: text("photo_url").notNull(),
  title: text("title"),
  description: text("description"),
  isRepeatable: boolean("is_repeatable").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const flashDealSizes = pgTable("flash_deal_sizes", {
  id: uuid("id").defaultRandom().primaryKey(),
  flashDealId: uuid("flash_deal_id")
    .references(() => flashDeals.id, { onDelete: "cascade" })
    .notNull(),
  sizeLabel: text("size_label").notNull(),
  estimatedAmount: numeric("estimated_amount", { precision: 12, scale: 2 }).notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id")
    .references(() => appointments.id, { onDelete: "cascade" })
    .notNull(),
  qpayInvoiceId: text("qpay_invoice_id"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const artistsRelations = relations(artists, ({ many }) => ({
  bookingRequests: many(bookingRequests),
  bookingSchedules: many(bookingSchedules),
  appointments: many(appointments),
  flashDeals: many(flashDeals),
}));

export const bookingRequestsRelations = relations(
  bookingRequests,
  ({ one, many }) => ({
    artist: one(artists, {
      fields: [bookingRequests.artistId],
      references: [artists.id],
    }),
    photos: many(bookingRequestPhotos),
    schedules: many(bookingSchedules),
    appointment: one(appointments, {
      fields: [bookingRequests.id],
      references: [appointments.bookingRequestId],
    }),
  })
);

export const bookingRequestPhotosRelations = relations(
  bookingRequestPhotos,
  ({ one }) => ({
    bookingRequest: one(bookingRequests, {
      fields: [bookingRequestPhotos.bookingRequestId],
      references: [bookingRequests.id],
    }),
  })
);

export const bookingSchedulesRelations = relations(
  bookingSchedules,
  ({ one }) => ({
    bookingRequest: one(bookingRequests, {
      fields: [bookingSchedules.bookingRequestId],
      references: [bookingRequests.id],
    }),
    artist: one(artists, {
      fields: [bookingSchedules.artistId],
      references: [artists.id],
    }),
  })
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  bookingRequest: one(bookingRequests, {
    fields: [appointments.bookingRequestId],
    references: [bookingRequests.id],
  }),
  schedule: one(bookingSchedules, {
    fields: [appointments.scheduleId],
    references: [bookingSchedules.id],
  }),
  artist: one(artists, {
    fields: [appointments.artistId],
    references: [artists.id],
  }),
  payment: one(payments, {
    fields: [appointments.id],
    references: [payments.appointmentId],
  }),
}));

export const flashDealsRelations = relations(flashDeals, ({ one, many }) => ({
  artist: one(artists, {
    fields: [flashDeals.artistId],
    references: [artists.id],
  }),
  sizes: many(flashDealSizes),
}));

export const flashDealSizesRelations = relations(flashDealSizes, ({ one }) => ({
  flashDeal: one(flashDeals, {
    fields: [flashDealSizes.flashDealId],
    references: [flashDeals.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  appointment: one(appointments, {
    fields: [payments.appointmentId],
    references: [appointments.id],
  }),
}));

// ─── Inferred types ───────────────────────────────────────────────────────────

export type Artist = typeof artists.$inferSelect;
export type ArtistInsert = typeof artists.$inferInsert;

export type BookingRequest = typeof bookingRequests.$inferSelect;
export type BookingRequestInsert = typeof bookingRequests.$inferInsert;

export type BookingRequestPhoto = typeof bookingRequestPhotos.$inferSelect;
export type BookingRequestPhotoInsert = typeof bookingRequestPhotos.$inferInsert;

export type BookingSchedule = typeof bookingSchedules.$inferSelect;
export type BookingScheduleInsert = typeof bookingSchedules.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type AppointmentInsert = typeof appointments.$inferInsert;

export type FlashDeal = typeof flashDeals.$inferSelect;
export type FlashDealInsert = typeof flashDeals.$inferInsert;

export type FlashDealSize = typeof flashDealSizes.$inferSelect;
export type FlashDealSizeInsert = typeof flashDealSizes.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type PaymentInsert = typeof payments.$inferInsert;
