import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { artists, flashDeals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ProfileBookingFlow } from "@/features/public-profile-booking/profile-booking-flow";

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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

  if (!artist) notFound();

  const deals = await db.query.flashDeals.findMany({
    where: and(eq(flashDeals.artistId, artist.id), eq(flashDeals.isActive, true)),
    with: { sizes: true },
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  return (
    <ProfileBookingFlow
      artist={JSON.parse(JSON.stringify(artist))}
      initialFlashDeals={JSON.parse(JSON.stringify(deals))}
    />
  );
}
