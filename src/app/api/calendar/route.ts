import { db } from "@/lib/db";
import { appointments, bookingSchedules } from "@/lib/db/schema";
import { eq, and, gte, lte, ne } from "drizzle-orm";
import { getAuthenticatedArtist, unauthorized, badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    if (!startDate || !endDate) {
      return badRequest("start and end query parameters are required (ISO 8601)");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const [confirmedAppointments, allSchedules] = await Promise.all([
      db.query.appointments.findMany({
        where: (t, { and, eq, gte, lte, ne }) =>
          and(
            eq(t.artistId, user.id),
            gte(t.chosenDatetime, start),
            lte(t.chosenDatetime, end),
            ne(t.status, "cancelled")
          ),
        with: {
          bookingRequest: {
            columns: { firstName: true, lastName: true, tattooSize: true, placement: true },
          },
          schedule: {
            columns: { durationMinutes: true, lowAmount: true, highAmount: true },
          },
        },
        orderBy: (t, { asc }) => [asc(t.chosenDatetime)],
      }),
      db.query.bookingSchedules.findMany({
        where: (t, { and, eq, gte, lte }) =>
          and(
            eq(t.artistId, user.id),
            gte(t.suggestedDatetime, start),
            lte(t.suggestedDatetime, end)
          ),
        with: {
          bookingRequest: {
            columns: { id: true, firstName: true, lastName: true, status: true },
          },
        },
      }),
    ]);

    const pendingSchedules = allSchedules.filter(
      (s) => s.bookingRequest?.status === "scheduled"
    );

    return NextResponse.json({
      appointments: confirmedAppointments,
      pending_schedules: pendingSchedules,
    });
  } catch {
    return serverError();
  }
}
