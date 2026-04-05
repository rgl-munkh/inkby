import { db } from "@/lib/db";
import { flashDeals, flashDealSizes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getAuthenticatedArtist,
  unauthorized,
  badRequest,
  notFound,
  serverError,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateFlashDealSchema = z.object({
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

    const deal = await db.query.flashDeals.findFirst({
      where: eq(flashDeals.id, id),
      with: { sizes: true },
    });

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

    const existing = await db.query.flashDeals.findFirst({
      where: (t, { and, eq }) => and(eq(t.id, id), eq(t.artistId, user.id)),
      columns: { id: true },
    });

    if (!existing) {
      return notFound("Flash deal not found");
    }

    const { sizes, title, description, is_repeatable, is_active } = parsed.data;

    const updateValues: Partial<typeof flashDeals.$inferInsert> = {};
    if (title !== undefined) updateValues.title = title;
    if (description !== undefined) updateValues.description = description;
    if (is_repeatable !== undefined) updateValues.isRepeatable = is_repeatable;
    if (is_active !== undefined) updateValues.isActive = is_active;

    if (Object.keys(updateValues).length > 0) {
      await db.update(flashDeals).set(updateValues).where(eq(flashDeals.id, id));
    }

    if (sizes) {
      await db.delete(flashDealSizes).where(eq(flashDealSizes.flashDealId, id));
      await db.insert(flashDealSizes).values(
        sizes.map((s) => ({
          flashDealId: id,
          sizeLabel: s.size_label,
          durationMinutes: s.duration_minutes ?? null,
          estimatedAmount: String(s.estimated_amount),
        }))
      );
    }

    const updated = await db.query.flashDeals.findFirst({
      where: eq(flashDeals.id, id),
      with: { sizes: true },
    });

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

    await db
      .delete(flashDeals)
      .where(and(eq(flashDeals.id, id), eq(flashDeals.artistId, user.id)));

    return NextResponse.json({ message: "Flash deal deleted" });
  } catch {
    return serverError();
  }
}
