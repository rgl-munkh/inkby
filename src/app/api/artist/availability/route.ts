import { db } from "@/lib/db";
import { artistAvailableDates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedArtist, unauthorized, badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const availabilitySchema = z.array(
  z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })
);

export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const rows = await db
      .select()
      .from(artistAvailableDates)
      .where(eq(artistAvailableDates.artistId, user.id))
      .orderBy(artistAvailableDates.date);

    return NextResponse.json({ availableDates: rows });
  } catch {
    return serverError();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const body = await request.json();
    const parsed = availabilitySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(artistAvailableDates)
        .where(eq(artistAvailableDates.artistId, user.id));

      if (parsed.data.length > 0) {
        await tx.insert(artistAvailableDates).values(
          parsed.data.map((row) => ({
            artistId: user.id,
            date: row.date,
            startTime: row.startTime,
            endTime: row.endTime,
          }))
        );
      }
    });

    const rows = await db
      .select()
      .from(artistAvailableDates)
      .where(eq(artistAvailableDates.artistId, user.id))
      .orderBy(artistAvailableDates.date);

    return NextResponse.json({ availableDates: rows });
  } catch {
    return serverError();
  }
}
