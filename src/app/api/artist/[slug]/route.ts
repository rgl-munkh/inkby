import { db } from "@/lib/db";
import { artists, flashDeals, flashDealSizes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const artist = await db.query.artists.findFirst({
      where: and(eq(artists.slug, slug), eq(artists.onboardingCompleted, true)),
      columns: {
        id: true,
        slug: true,
        displayName: true,
        instagramUsername: true,
        depositAmount: true,
        studioLocation: true,
        avatarUrl: true,
        bio: true,
      },
    });

    if (!artist) {
      return notFound("Artist not found");
    }

    const deals = await db.query.flashDeals.findMany({
      where: and(eq(flashDeals.artistId, artist.id), eq(flashDeals.isActive, true)),
      with: { sizes: true },
      orderBy: (flashDeals, { desc }) => [desc(flashDeals.createdAt)],
    });

    return NextResponse.json({ artist, flash_deals: deals });
  } catch {
    return serverError();
  }
}
