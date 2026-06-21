import { db } from "@/lib/db";
import { appointments, bookingSchedules } from "@/lib/db/schema";
import { and, eq, inArray, ne } from "drizzle-orm";

// Appointment statuses that occupy a time slot (i.e. block other bookings).
// "cancelled" is intentionally excluded so cancelled/rescheduled-away slots free up.
const ACTIVE_STATUSES = ["pending_payment", "paid", "completed"] as const;

export interface TimeInterval {
  start: number; // epoch ms, inclusive
  end: number; // epoch ms, exclusive
}

/** Absolute time interval [start, end) for an appointment, in epoch ms. */
export function appointmentInterval(
  chosenDatetime: Date | string,
  durationMinutes: number
): TimeInterval {
  const start = new Date(chosenDatetime).getTime();
  return { start, end: start + durationMinutes * 60_000 };
}

/** Half-open interval overlap: [aStart,aEnd) intersects [bStart,bEnd). */
export function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return a.start < b.end && b.start < a.end;
}

export interface ConflictCheckParams {
  artistId: string;
  datetime: Date | string;
  durationMinutes: number;
  /** Appointment to ignore (e.g. the one being rescheduled). */
  excludeAppointmentId?: string;
}

/**
 * True if the candidate appointment time overlaps any active appointment for
 * the artist. Compares absolute time intervals, so it is timezone-agnostic.
 */
export async function hasConflict({
  artistId,
  datetime,
  durationMinutes,
  excludeAppointmentId,
}: ConflictCheckParams): Promise<boolean> {
  const candidate = appointmentInterval(datetime, durationMinutes);

  const rows = await db
    .select({
      id: appointments.id,
      chosenDatetime: appointments.chosenDatetime,
      durationMinutes: bookingSchedules.durationMinutes,
    })
    .from(appointments)
    .innerJoin(bookingSchedules, eq(appointments.scheduleId, bookingSchedules.id))
    .where(
      and(
        eq(appointments.artistId, artistId),
        inArray(appointments.status, [...ACTIVE_STATUSES]),
        excludeAppointmentId
          ? ne(appointments.id, excludeAppointmentId)
          : undefined
      )
    );

  return rows.some((r) =>
    intervalsOverlap(
      candidate,
      appointmentInterval(r.chosenDatetime, r.durationMinutes)
    )
  );
}
