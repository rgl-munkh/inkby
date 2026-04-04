import { db } from "@/lib/db";
import { bookingRequests, bookingSchedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getAuthenticatedArtist,
  unauthorized,
  badRequest,
  notFound,
  serverError,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const scheduleSchema = z.object({
  duration_minutes: z.number().int().positive(),
  suggested_dates: z
    .array(z.object({ datetime: z.string().datetime() }))
    .min(1, "At least one suggested date is required"),
  low_amount: z.number().positive(),
  high_amount: z.number().positive(),
  message: z.string().max(2000).optional(),
  private_note: z.string().max(2000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const { id: bookingRequestId } = await params;
    const body = await request.json();
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    if (parsed.data.high_amount < parsed.data.low_amount) {
      return badRequest("High amount must be greater than or equal to low amount");
    }

    const bookingRequest = await db.query.bookingRequests.findFirst({
      where: (t, { and, eq }) =>
        and(eq(t.id, bookingRequestId), eq(t.artistId, user.id)),
      columns: { id: true, status: true },
    });

    if (!bookingRequest) {
      return notFound("Booking request not found");
    }

    if (bookingRequest.status !== "pending") {
      return badRequest("Booking request is not in pending status");
    }

    const scheduleValues = parsed.data.suggested_dates.map((date) => ({
      bookingRequestId,
      artistId: user.id,
      durationMinutes: parsed.data.duration_minutes,
      suggestedDatetime: new Date(date.datetime),
      lowAmount: String(parsed.data.low_amount),
      highAmount: String(parsed.data.high_amount),
      message: parsed.data.message ?? null,
      privateNote: parsed.data.private_note ?? null,
    }));

    const createdSchedules = await db
      .insert(bookingSchedules)
      .values(scheduleValues)
      .returning();

    await db
      .update(bookingRequests)
      .set({ status: "scheduled" })
      .where(eq(bookingRequests.id, bookingRequestId));

    return NextResponse.json({ schedules: createdSchedules }, { status: 201 });
  } catch {
    return serverError();
  }
}
