import {
  getAuthenticatedArtist,
  unauthorized,
  badRequest,
  notFound,
  serverError,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteFlashDealForArtist,
  getFlashDealById,
  updateFlashDealForArtist,
} from "@/features/flash-deals/services/flash-deals-server";

const updateFlashDealSchema = z.object({
  photo_url: z.string().url().optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  is_repeatable: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sizes: z
    .array(
      z.object({
        size_label: z.string().min(1).max(50),
        estimated_amount: z.number().positive(),
        duration_minutes: z.number().int().positive().optional(),
      })
    )
    .optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deal = await getFlashDealById(id);

    if (!deal) {
      return notFound("Flash deal not found");
    }

    return NextResponse.json({ flash_deal: deal });
  } catch {
    return serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const { id } = await params;
    const body = await request.json();
    const parsed = updateFlashDealSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { sizes, title, description, is_repeatable, is_active, photo_url } =
      parsed.data;

    const updated = await updateFlashDealForArtist({
      id,
      artistId: user.id,
      photoUrl: photo_url,
      title,
      description,
      isRepeatable: is_repeatable,
      isActive: is_active,
      sizes,
    });

    if (!updated) {
      return notFound("Flash deal not found");
    }

    return NextResponse.json({ flash_deal: updated });
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const { id } = await params;

    await deleteFlashDealForArtist({ id, artistId: user.id });

    return NextResponse.json({ message: "Flash deal deleted" });
  } catch {
    return serverError();
  }
}
