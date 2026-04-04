import { db } from "@/lib/db";
import { flashDeals, flashDealSizes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getAuthenticatedArtist,
  unauthorized,
  badRequest,
  serverError,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createFlashDealSchema = z.object({
  photo_url: z.string().url(),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  is_repeatable: z.boolean().default(false),
  sizes: z
    .array(
      z.object({
        size_label: z.string().min(1).max(50),
        estimated_amount: z.number().positive(),
      })
    )
    .min(1, "At least one size is required"),
});

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const body = await request.json();
    const parsed = createFlashDealSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { sizes, photo_url, title, description, is_repeatable } = parsed.data;

    const [deal] = await db
      .insert(flashDeals)
      .values({
        artistId: user.id,
        photoUrl: photo_url,
        title: title ?? null,
        description: description ?? null,
        isRepeatable: is_repeatable,
      })
      .returning();

    await db.insert(flashDealSizes).values(
      sizes.map((s) => ({
        flashDealId: deal.id,
        sizeLabel: s.size_label,
        estimatedAmount: String(s.estimated_amount),
      }))
    );

    const fullDeal = await db.query.flashDeals.findFirst({
      where: eq(flashDeals.id, deal.id),
      with: { sizes: true },
    });

    return NextResponse.json({ flash_deal: fullDeal }, { status: 201 });
  } catch {
    return serverError();
  }
}

export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const deals = await db.query.flashDeals.findMany({
      where: eq(flashDeals.artistId, user.id),
      with: { sizes: true },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    return NextResponse.json({ flash_deals: deals });
  } catch {
    return serverError();
  }
}
