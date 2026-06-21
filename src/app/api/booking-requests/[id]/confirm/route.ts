import { db } from "@/lib/db";
import { bookingRequests, appointments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  badRequest,
  getAuthenticatedArtist,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/auth";
import { getBookingTokenFromRequest, verifyBookingToken } from "@/lib/booking-token";
import { hasConflict } from "@/lib/domain/scheduling";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const confirmSchema = z.object({
  chosen_datetime: z.string().datetime().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingRequestId } = await params;
    const body = await request.json();
    const parsed = confirmSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const booking = await db.query.bookingRequests.findFirst({
      where: eq(bookingRequests.id, bookingRequestId),
      columns: { id: true, artistId: true, status: true },
      with: {
        schedules: {
          columns: { id: true, suggestedDatetime: true, durationMinutes: true },
        },
      },
    });

    if (!booking) {
      return notFound("Booking request not found");
    }

    // Authorize: the owning artist (session) or a valid per-booking token.
    const { user } = await getAuthenticatedArtist();
    const isArtist = !!user && user.id === booking.artistId;
    const hasToken = verifyBookingToken(
      booking.id,
      getBookingTokenFromRequest(request)
    );
    if (!isArtist && !hasToken) {
      return unauthorized();
    }

    if (booking.status !== "scheduled") {
      return badRequest("Booking is not in scheduled status");
    }

    if (booking.schedules.length === 0) {
      return badRequest("No schedule found for this booking");
    }

    const fallback = parsed.data.chosen_datetime
      ? new Date(parsed.data.chosen_datetime)
      : null;

    const rows = booking.schedules
      .map((s) => ({
        bookingRequestId,
        scheduleId: s.id,
        artistId: booking.artistId,
        chosenDatetime: s.suggestedDatetime ?? fallback,
        durationMinutes: s.durationMinutes,
      }))
      .filter((r): r is typeof r & { chosenDatetime: Date } => r.chosenDatetime !== null);

    if (rows.length === 0) {
      return badRequest(
        "No datetime available — provide chosen_datetime for schedules without a suggested date"
      );
    }

    // Reject if any chosen time collides with an existing appointment for the artist.
    for (const row of rows) {
      const conflict = await hasConflict({
        artistId: booking.artistId,
        datetime: row.chosenDatetime,
        durationMinutes: row.durationMinutes,
      });
      if (conflict) {
        return badRequest(
          "That time is no longer available — it overlaps another appointment. Please pick a different slot."
        );
      }
    }

    await db.insert(appointments).values(
      rows.map((r) => ({
        bookingRequestId: r.bookingRequestId,
        scheduleId: r.scheduleId,
        artistId: r.artistId,
        chosenDatetime: r.chosenDatetime,
      }))
    );

    await db
      .update(bookingRequests)
      .set({ status: "confirmed" })
      .where(eq(bookingRequests.id, bookingRequestId));

    return NextResponse.json({ appointments: rows.length }, { status: 201 });
  } catch {
    return serverError();
  }
}
