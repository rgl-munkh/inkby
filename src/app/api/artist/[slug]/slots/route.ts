import { db } from "@/lib/db";
import { artists, artistAvailableDates, appointments } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { notFound, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

function generate30MinSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let minutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  while (minutes < endMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    minutes += 30;
  }
  return slots;
}

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json(
        { error: "date query param required (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    const artist = await db.query.artists.findFirst({
      where: and(eq(artists.slug, slug), eq(artists.onboardingCompleted, true)),
      columns: { id: true },
    });

    if (!artist) return notFound("Artist not found");

    // Build 7-day window: dateParam through dateParam+6 days
    const windowStart = new Date(`${dateParam}T00:00:00`);
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + 6);
    const windowEndStr = toDateString(windowEnd);

    const availRows = await db
      .select()
      .from(artistAvailableDates)
      .where(
        and(
          eq(artistAvailableDates.artistId, artist.id),
          gte(artistAvailableDates.date, dateParam),
          lte(artistAvailableDates.date, windowEndStr)
        )
      )
      .orderBy(artistAvailableDates.date);

    // Fetch confirmed/pending_payment appointments in window to mark taken slots
    const windowStartTs = new Date(`${dateParam}T00:00:00Z`);
    const windowEndTs = new Date(`${windowEndStr}T23:59:59Z`);

    const bookedAppts = await db
      .select({ chosenDatetime: appointments.chosenDatetime })
      .from(appointments)
      .where(
        and(
          eq(appointments.artistId, artist.id),
          gte(appointments.chosenDatetime, windowStartTs),
          lte(appointments.chosenDatetime, windowEndTs)
        )
      );

    // Build a set of booked "YYYY-MM-DD HH:mm" strings for fast lookup
    const bookedSet = new Set<string>();
    for (const appt of bookedAppts) {
      const d = new Date(appt.chosenDatetime);
      const dateStr = toDateString(d);
      const timeStr = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
      bookedSet.add(`${dateStr} ${timeStr}`);
    }

    const dates = availRows.map((row) => ({
      date: row.date,
      startTime: row.startTime,
      endTime: row.endTime,
      slots: generate30MinSlots(row.startTime, row.endTime).map((time) => ({
        time,
        available: !bookedSet.has(`${row.date} ${time}`),
      })),
    }));

    return NextResponse.json({ dates });
  } catch {
    return serverError();
  }
}
