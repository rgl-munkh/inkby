import { db } from "@/lib/db";
import { artists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedArtist, unauthorized, badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const onboardingSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9._]+$/, "Slug must be lowercase alphanumeric, dots, or underscores"),
  instagram_username: z.string().min(1).max(30),
  deposit_amount: z.number().positive(),
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

    const { slug, instagram_username, deposit_amount } = parsed.data;

    const existingSlug = await db.query.artists.findFirst({
      where: (t, { and, eq, ne }) => and(eq(t.slug, slug), ne(t.id, user.id)),
      columns: { id: true },
    });

    if (existingSlug) {
      return badRequest("This username is already taken");
    }

    const [updated] = await db
      .update(artists)
      .set({
        slug,
        instagramUsername: instagram_username,
        depositAmount: String(deposit_amount),
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
