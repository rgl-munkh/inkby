import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
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
import { hasConflict } from "@/lib/domain/scheduling";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      columns: {
        id: true,
        artistId: true,
        bookingRequestId: true,
        chosenDatetime: true,
        status: true,
        rescheduleCount: true,
        previousDatetime: true,
        cancelledAt: true,
        cancelledBy: true,
        cancellationReason: true,
      },
      with: {
        bookingRequest: {
          columns: { firstName: true, lastName: true, email: true, ideaDescription: true, tattooSize: true, placement: true },
        },
        schedule: {
          columns: { durationMinutes: true, suggestedDatetime: true, lowAmount: true, highAmount: true, message: true },
        },
        artist: {
          columns: { displayName: true, slug: true, depositAmount: true, studioLocation: true, cancellationNoticeHours: true, maxReschedules: true },
        },
      },
    });

    if (!appointment) {
      return notFound("Appointment not found");
    }

    // Authorize: the owning artist (session) or a valid per-booking token.
    const { user } = await getAuthenticatedArtist();
    const isArtist = !!user && user.id === appointment.artistId;
    const hasToken = verifyBookingToken(
      appointment.bookingRequestId,
      getBookingTokenFromRequest(request)
    );
    if (!isArtist && !hasToken) {
      return unauthorized();
    }

    const { artistId: _artistId, bookingRequestId: _bookingRequestId, ...rest } =
      appointment;
    return NextResponse.json({ appointment: rest });
  } catch {
    return serverError();
  }
}

const rescheduleSchema = z.object({
  chosen_datetime: z.string().datetime(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = rescheduleSchema.safeParse(body);
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
        schedule: { columns: { durationMinutes: true } },
        artist: {
          columns: { cancellationNoticeHours: true, maxReschedules: true },
        },
      },
    });

    if (!appointment) {
      return notFound("Appointment not found");
    }

    // Actor: authenticated owner artist bypasses the policy window/cap; a client
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
    }

    const newDatetime = new Date(parsed.data.chosen_datetime);
    if (newDatetime.getTime() <= Date.now()) {
      return badRequest("New appointment time must be in the future");
    }

    if (!isArtist) {
      const state = getCancellationState({
        now: new Date(),
        chosenDatetime: appointment.chosenDatetime,
        status: appointment.status,
        rescheduleCount: appointment.rescheduleCount,
        cancellationNoticeHours: appointment.artist.cancellationNoticeHours,
        maxReschedules: appointment.artist.maxReschedules,
      });
      if (state.isTerminal) {
        return badRequest("This appointment can no longer be changed");
      }
      if (state.withinNoticeWindow) {
        return badRequest(
          `Reschedules must be made at least ${appointment.artist.cancellationNoticeHours}h in advance. Please contact the artist.`
        );
      }
      if (state.reschedulesLeft <= 0) {
        return badRequest(
          "You've reached the maximum number of reschedules. Please contact the artist."
        );
      }
    } else if (appointment.status === "cancelled") {
      return badRequest("This appointment is cancelled");
    }

    const conflict = await hasConflict({
      artistId: appointment.artistId,
      datetime: newDatetime,
      durationMinutes: appointment.schedule.durationMinutes,
      excludeAppointmentId: appointment.id,
    });
    if (conflict) {
      return badRequest("That time overlaps another appointment. Pick a different slot.");
    }

    const [updated] = await db
      .update(appointments)
      .set({
        previousDatetime: appointment.chosenDatetime,
        chosenDatetime: newDatetime,
        rescheduleCount: isArtist
          ? appointment.rescheduleCount
          : appointment.rescheduleCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    return NextResponse.json({ appointment: updated });
  } catch {
    return serverError();
  }
}
