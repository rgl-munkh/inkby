import { db } from "@/lib/db";
import { appointments, bookingRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  badRequest,
  getAuthenticatedArtist,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/auth";
import { getBookingTokenFromRequest, verifyBookingToken } from "@/lib/booking-token";
import { getCancellationState } from "@/lib/domain/cancellation";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = cancelSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      columns: {
        id: true,
        artistId: true,
        bookingRequestId: true,
        chosenDatetime: true,
        status: true,
        rescheduleCount: true,
      },
      with: {
        artist: {
          columns: { cancellationNoticeHours: true, maxReschedules: true },
        },
      },
    });

    if (!appointment) {
      return notFound("Appointment not found");
    }

    if (appointment.status === "cancelled") {
      return badRequest("This appointment is already cancelled");
    }

    // Actor: authenticated owner artist bypasses the policy window; a client
    // must present a valid per-booking token.
    const { user } = await getAuthenticatedArtist();
    const isArtist = !!user && user.id === appointment.artistId;

    if (!isArtist) {
      const hasToken = verifyBookingToken(
        appointment.bookingRequestId,
        getBookingTokenFromRequest(request)
      );
      if (!hasToken) {
        return unauthorized();
      }
      const state = getCancellationState({
        now: new Date(),
        chosenDatetime: appointment.chosenDatetime,
        status: appointment.status,
        rescheduleCount: appointment.rescheduleCount,
        cancellationNoticeHours: appointment.artist.cancellationNoticeHours,
        maxReschedules: appointment.artist.maxReschedules,
      });
      if (state.isTerminal) {
        return badRequest("This appointment can no longer be cancelled");
      }
      // Note: cancellations are allowed inside the notice window (deposit is
      // forfeited). The window only blocks reschedules — see the PATCH route.
    }

    const cancelledBy = isArtist ? "artist" : "client";
    const now = new Date();

    const updated = await db.transaction(async (tx) => {
      const [appt] = await tx
        .update(appointments)
        .set({
          status: "cancelled",
          cancelledAt: now,
          cancelledBy,
          cancellationReason: parsed.data.reason ?? null,
          updatedAt: now,
        })
        .where(eq(appointments.id, id))
        .returning();

      await tx
        .update(bookingRequests)
        .set({ status: "cancelled", updatedAt: now })
        .where(eq(bookingRequests.id, appointment.bookingRequestId));

      return appt;
    });

    return NextResponse.json({ appointment: updated });
  } catch {
    return serverError();
  }
}
