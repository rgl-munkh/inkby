import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookingRequestPhotos, bookingRequests } from "@/lib/db/schema";

export async function createPublicBookingRequest({
  artistId,
  firstName,
  lastName,
  phone,
  email,
  ideaDescription,
  tattooSize,
  placement,
  photoUrls,
}: {
  artistId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  ideaDescription: string;
  tattooSize: "small" | "medium" | "large" | "extra-large";
  placement: string;
  photoUrls?: string[];
}) {
  const [booking] = await db
    .insert(bookingRequests)
    .values({
      artistId,
      firstName,
      lastName,
      phone,
      email,
      ideaDescription,
      tattooSize,
      placement,
    })
    .returning();

  if (photoUrls && photoUrls.length > 0) {
    await db.insert(bookingRequestPhotos).values(
      photoUrls.map((url) => ({
        bookingRequestId: booking.id,
        photoUrl: url,
      })),
    );
  }

  return booking;
}

export async function listBookingRequestsForArtist({
  artistId,
  status,
  page,
  limit,
}: {
  artistId: string;
  status: typeof bookingRequests.$inferSelect.status | null;
  page: number;
  limit: number;
}) {
  const offset = (page - 1) * limit;

  const where = status
    ? and(eq(bookingRequests.artistId, artistId), eq(bookingRequests.status, status))
    : eq(bookingRequests.artistId, artistId);

  const [requests, [{ total }]] = await Promise.all([
    db.query.bookingRequests.findMany({
      where: status
        ? (table, { and: andWhere, eq: eqWhere }) =>
            andWhere(eqWhere(table.artistId, artistId), eqWhere(table.status, status))
        : (table, { eq: eqWhere }) => eqWhere(table.artistId, artistId),
      with: { photos: true },
      orderBy: [desc(bookingRequests.createdAt)],
      limit,
      offset,
    }),
    db.select({ total: count() }).from(bookingRequests).where(where),
  ]);

  return {
    requests,
    total: Number(total),
  };
}
