import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        bookingRequest: {
          columns: { firstName: true, lastName: true, email: true, ideaDescription: true, tattooSize: true, placement: true },
        },
        schedule: {
          columns: { durationMinutes: true, suggestedDatetime: true, lowAmount: true, highAmount: true, message: true },
        },
        artist: {
          columns: { displayName: true, slug: true, depositAmount: true, studioLocation: true },
        },
      },
    });

    if (!appointment) {
      return notFound("Appointment not found");
    }

    return NextResponse.json({ appointment });
  } catch {
    return serverError();
  }
}
