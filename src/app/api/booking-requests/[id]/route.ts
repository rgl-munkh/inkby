import { db } from "@/lib/db";
import { bookingRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedArtist, notFound, serverError, unauthorized } from "@/lib/auth";
import { getBookingTokenFromRequest, verifyBookingToken } from "@/lib/booking-token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await db.query.bookingRequests.findFirst({
      where: eq(bookingRequests.id, id),
      with: {
        photos: true,
        schedules: {
          columns: {
            id: true,
            durationMinutes: true,
            lowAmount: true,
            highAmount: true,
            message: true,
            suggestedDatetime: true,
            createdAt: true,
          },
        },
        appointment: {
          columns: {
            id: true,
            status: true,
            chosenDatetime: true,
            rescheduleCount: true,
            cancelledAt: true,
            cancelledBy: true,
            cancellationReason: true,
          },
        },
        artist: {
          columns: {
            slug: true,
            displayName: true,
            avatarUrl: true,
            instagramUsername: true,
            cancellationNoticeHours: true,
            maxReschedules: true,
          },
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

    return NextResponse.json({ booking_request: booking });
  } catch {
    return serverError();
  }
}
