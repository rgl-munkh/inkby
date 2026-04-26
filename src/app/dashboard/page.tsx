import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { bookingRequests, artists } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { RequestTabs } from "@/features/dashboard-inbox/request-tabs";
import { BOOKING_REQUEST_LIMIT } from "@/lib/constants";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [artist, initialRequests, [{ total }]] = await Promise.all([
    db.query.artists.findFirst({
      where: eq(artists.id, user.id),
      columns: { slug: true, displayName: true, instagramUsername: true },
    }),
    db.query.bookingRequests.findMany({
      where: eq(bookingRequests.artistId, user.id),
      with: { photos: { columns: { photoUrl: true } } },
      orderBy: [desc(bookingRequests.createdAt)],
      limit: BOOKING_REQUEST_LIMIT,
    }),
    db
      .select({ total: count() })
      .from(bookingRequests)
      .where(eq(bookingRequests.artistId, user.id)),
  ]);

  if (!artist) redirect("/login");

  return (
    <RequestTabs
      initialRequests={JSON.parse(JSON.stringify(initialRequests))}
      initialCount={Number(total)}
      artist={artist}
    />
  );
}
