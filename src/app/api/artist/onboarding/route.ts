import { db } from "@/lib/db";
import { artists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedArtist, unauthorized, badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const onboardingSchema = z.object({
  instagram_username: z.string().min(1).max(30),
  display_name: z.string().min(1).max(100).optional(),
  deposit_amount: z.number().positive(),
  studio_location: z.string().min(1),
  studio_lat: z.number().optional(),
  studio_lng: z.number().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { instagram_username, display_name, deposit_amount, studio_location, studio_lat, studio_lng } = parsed.data;

    const [updated] = await db
      .update(artists)
      .set({
        instagramUsername: instagram_username,
        displayName: display_name ?? null,
        depositAmount: String(deposit_amount),
        studioLocation: studio_location,
        studioLat: studio_lat ?? null,
        studioLng: studio_lng ?? null,
        onboardingCompleted: true,
      })
      .where(eq(artists.id, user.id))
      .returning();

    if (!updated) {
      return serverError("Failed to update artist profile");
    }

    return NextResponse.json({ artist: updated });
  } catch {
    return serverError();
  }
}
