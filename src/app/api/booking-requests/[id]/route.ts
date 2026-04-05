import { db } from "@/lib/db";
import { bookingRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await db.query.bookingRequests.findFirst({
      where: eq(bookingRequests.id, id),
      with: {
        photos: true,
        schedules: true,
        artist: {
          columns: {
            slug: true,
            displayName: true,
            avatarUrl: true,
            instagramUsername: true,
          },
        },
      },
    });

    if (!booking) {
      return notFound("Booking request not found");
    }

    return NextResponse.json({ booking_request: booking });
  } catch {
    return serverError();
  }
}
