import { db } from "@/lib/db";
import { artists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedArtist, unauthorized, badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  instagram_username: z.string().min(1).max(30).optional(),
  deposit_amount: z.number().positive().optional(),
  studio_location: z.string().min(1).optional(),
  studio_lat: z.number().optional(),
  studio_lng: z.number().optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
});

export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const artist = await db.query.artists.findFirst({
      where: eq(artists.id, user.id),
    });

    if (!artist) {
      return serverError("Artist profile not found");
    }

    return NextResponse.json({ artist });
  } catch {
    return serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const {
      display_name,
      instagram_username,
      deposit_amount,
      studio_location,
      studio_lat,
      studio_lng,
      bio,
      avatar_url,
    } = parsed.data;

    const updateValues: Partial<typeof artists.$inferInsert> = {};
    if (display_name !== undefined) updateValues.displayName = display_name;
    if (instagram_username !== undefined) updateValues.instagramUsername = instagram_username;
    if (deposit_amount !== undefined) updateValues.depositAmount = String(deposit_amount);
    if (studio_location !== undefined) updateValues.studioLocation = studio_location;
    if (studio_lat !== undefined) updateValues.studioLat = studio_lat;
    if (studio_lng !== undefined) updateValues.studioLng = studio_lng;
    if (bio !== undefined) updateValues.bio = bio;
    if (avatar_url !== undefined) updateValues.avatarUrl = avatar_url;

    const [updated] = await db
      .update(artists)
      .set(updateValues)
      .where(eq(artists.id, user.id))
      .returning();

    return NextResponse.json({ artist: updated });
  } catch {
    return serverError();
  }
}
