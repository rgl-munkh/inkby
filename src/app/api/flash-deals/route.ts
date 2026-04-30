import {
  getAuthenticatedArtist,
  unauthorized,
  badRequest,
  serverError,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createFlashDealForArtist,
  listFlashDealsForArtist,
} from "@/features/flash-deals/services/flash-deals-server";

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
        duration_minutes: z.number().int().positive().optional(),
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

    const fullDeal = await createFlashDealForArtist({
      artistId: user.id,
      photoUrl: photo_url,
      title,
      description,
      isRepeatable: is_repeatable,
      sizes,
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

    const deals = await listFlashDealsForArtist(user.id);

    return NextResponse.json({ flash_deals: deals });
  } catch {
    return serverError();
  }
}
