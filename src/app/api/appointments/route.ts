import { db } from "@/lib/db";
import { appointments, bookingRequests, bookingSchedules } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import {
  getAuthenticatedArtist,
  unauthorized,
  badRequest,
  serverError,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const confirmAppointmentSchema = z.object({
  booking_request_id: z.string().uuid(),
  schedule_id: z.string().uuid(),
  chosen_datetime: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const body = await request.json();
    const parsed = confirmAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { booking_request_id, schedule_id, chosen_datetime } = parsed.data;

    const schedule = await db.query.bookingSchedules.findFirst({
      where: (t, { and, eq }) =>
        and(eq(t.id, schedule_id), eq(t.bookingRequestId, booking_request_id)),
      columns: { id: true, artistId: true },
    });

    if (!schedule) {
      return badRequest("Invalid schedule or booking request");
    }

    const existingAppointment = await db.query.appointments.findFirst({
      where: (t, { and, eq, ne }) =>
        and(eq(t.bookingRequestId, booking_request_id), ne(t.status, "cancelled")),
      columns: { id: true },
    });

    if (existingAppointment) {
      return badRequest("An appointment already exists for this booking request");
    }

    const [appointment] = await db
      .insert(appointments)
      .values({
        bookingRequestId: booking_request_id,
        scheduleId: schedule_id,
        artistId: schedule.artistId,
        chosenDatetime: new Date(chosen_datetime),
        status: "pending_payment",
      })
      .returning();

    await db
      .update(bookingRequests)
      .set({ status: "confirmed" })
      .where(eq(bookingRequests.id, booking_request_id));

    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    return serverError();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as typeof appointments.$inferSelect.status | null;

    const results = await db.query.appointments.findMany({
      where: status
        ? (t, { and, eq }) => and(eq(t.artistId, user.id), eq(t.status, status))
        : (t, { eq }) => eq(t.artistId, user.id),
      with: {
        bookingRequest: {
          columns: { firstName: true, lastName: true, phone: true, email: true, ideaDescription: true, tattooSize: true, placement: true },
        },
        schedule: {
          columns: { durationMinutes: true, lowAmount: true, highAmount: true },
        },
      },
      orderBy: (t, { asc }) => [asc(t.chosenDatetime)],
    });

    return NextResponse.json({ appointments: results });
  } catch {
    return serverError();
  }
}
