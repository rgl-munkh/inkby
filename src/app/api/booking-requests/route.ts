import { db } from "@/lib/db";
import { bookingRequests, bookingRequestPhotos } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { getAuthenticatedArtist, unauthorized, badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createBookingSchema = z.object({
  artist_id: z.string().uuid(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone: z.string().min(6).max(20),
  email: z.string().email(),
  idea_description: z.string().min(1).max(2000),
  tattoo_size: z.enum(["small", "medium", "large", "extra-large"]),
  placement: z.string().min(1).max(200),
  photo_urls: z.array(z.string().url()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { photo_urls, artist_id, first_name, last_name, phone, email, idea_description, tattoo_size, placement } = parsed.data;

    const [booking] = await db
      .insert(bookingRequests)
      .values({
        artistId: artist_id,
        firstName: first_name,
        lastName: last_name,
        phone,
        email,
        ideaDescription: idea_description,
        tattooSize: tattoo_size,
        placement,
      })
      .returning();

    if (photo_urls && photo_urls.length > 0) {
      await db.insert(bookingRequestPhotos).values(
        photo_urls.map((url) => ({
          bookingRequestId: booking.id,
          photoUrl: url,
        }))
      );
    }

    return NextResponse.json({ booking_request: booking }, { status: 201 });
  } catch {
    return serverError();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as typeof bookingRequests.$inferSelect.status | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const [requests, [{ total }]] = await Promise.all([
      db.query.bookingRequests.findMany({
        where: status
          ? (t, { and, eq }) => and(eq(t.artistId, user.id), eq(t.status, status))
          : (t, { eq }) => eq(t.artistId, user.id),
        with: { photos: true },
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        limit,
        offset,
      }),
      db
        .select({ total: count() })
        .from(bookingRequests)
        .where(
          status
            ? and(eq(bookingRequests.artistId, user.id), eq(bookingRequests.status, status))
            : eq(bookingRequests.artistId, user.id)
        ),
    ]);

    return NextResponse.json({
      booking_requests: requests,
      pagination: { page, limit, total: Number(total) },
    });
  } catch {
    return serverError();
  }
}
