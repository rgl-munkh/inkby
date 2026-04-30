import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { flashDeals, flashDealSizes } from "@/lib/db/schema";

export type FlashDealSizeInput = {
  size_label: string;
  estimated_amount: number;
  duration_minutes?: number;
};

export async function createFlashDealForArtist({
  artistId,
  photoUrl,
  title,
  description,
  isRepeatable,
  sizes,
}: {
  artistId: string;
  photoUrl: string;
  title?: string;
  description?: string;
  isRepeatable: boolean;
  sizes: FlashDealSizeInput[];
}) {
  const [deal] = await db
    .insert(flashDeals)
    .values({
      artistId,
      photoUrl,
      title: title ?? null,
      description: description ?? null,
      isRepeatable,
    })
    .returning();

  await db.insert(flashDealSizes).values(
    sizes.map((size) => ({
      flashDealId: deal.id,
      sizeLabel: size.size_label,
      durationMinutes: size.duration_minutes ?? null,
      estimatedAmount: String(size.estimated_amount),
    })),
  );

  return getFlashDealById(deal.id);
}

export function listFlashDealsForArtist(artistId: string) {
  return db.query.flashDeals.findMany({
    where: eq(flashDeals.artistId, artistId),
    with: { sizes: true },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
}

export function getFlashDealById(id: string) {
  return db.query.flashDeals.findFirst({
    where: eq(flashDeals.id, id),
    with: { sizes: true },
  });
}

export async function updateFlashDealForArtist({
  id,
  artistId,
  photoUrl,
  title,
  description,
  isRepeatable,
  isActive,
  sizes,
}: {
  id: string;
  artistId: string;
  photoUrl?: string;
  title?: string;
  description?: string;
  isRepeatable?: boolean;
  isActive?: boolean;
  sizes?: FlashDealSizeInput[];
}) {
  const existing = await db.query.flashDeals.findFirst({
    where: (table, { and: andWhere, eq: eqWhere }) =>
      andWhere(eqWhere(table.id, id), eqWhere(table.artistId, artistId)),
    columns: { id: true },
  });

  if (!existing) return null;

  const updateValues: Partial<typeof flashDeals.$inferInsert> = {};
  if (photoUrl !== undefined) updateValues.photoUrl = photoUrl;
  if (title !== undefined) updateValues.title = title;
  if (description !== undefined) updateValues.description = description;
  if (isRepeatable !== undefined) updateValues.isRepeatable = isRepeatable;
  if (isActive !== undefined) updateValues.isActive = isActive;

  if (Object.keys(updateValues).length > 0) {
    await db.update(flashDeals).set(updateValues).where(eq(flashDeals.id, id));
  }

  if (sizes) {
    await db.delete(flashDealSizes).where(eq(flashDealSizes.flashDealId, id));
    await db.insert(flashDealSizes).values(
      sizes.map((size) => ({
        flashDealId: id,
        sizeLabel: size.size_label,
        durationMinutes: size.duration_minutes ?? null,
        estimatedAmount: String(size.estimated_amount),
      })),
    );
  }

  return getFlashDealById(id);
}

export function deleteFlashDealForArtist({
  id,
  artistId,
}: {
  id: string;
  artistId: string;
}) {
  return db
    .delete(flashDeals)
    .where(and(eq(flashDeals.id, id), eq(flashDeals.artistId, artistId)));
}
