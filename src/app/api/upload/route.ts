import { createServiceClient } from "@/lib/supabase/server";
import { getAuthenticatedArtist, unauthorized, badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Detect the real image type from magic bytes. Returns null for anything that
// is not an allowlisted raster image (so SVG/HTML/scripts are rejected).
function sniffImageType(
  bytes: Uint8Array
): { contentType: string; ext: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg", ext: "jpg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { contentType: "image/png", ext: "png" };
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38
  ) {
    return { contentType: "image/gif", ext: "gif" };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { contentType: "image/webp", ext: "webp" };
  }
  return null;
}

// reference-photos is uploaded by the public booking wizard (no session yet),
// so it's the one bucket that allows unauthenticated uploads. Artist-owned
// buckets still require a session.
const PUBLIC_BUCKETS = ["reference-photos"];
const ARTIST_BUCKETS = ["flash-deal-photos", "avatars"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;

    if (!file) {
      return badRequest("file is required");
    }

    if (!bucket) {
      return badRequest("bucket is required (reference-photos, flash-deal-photos, avatars)");
    }

    if (![...PUBLIC_BUCKETS, ...ARTIST_BUCKETS].includes(bucket)) {
      return badRequest(
        `Invalid bucket. Must be one of: ${[...PUBLIC_BUCKETS, ...ARTIST_BUCKETS].join(", ")}`
      );
    }

    if (!PUBLIC_BUCKETS.includes(bucket)) {
      const { user, error: authError } = await getAuthenticatedArtist();
      if (authError || !user) return unauthorized();
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return badRequest("File too large. Maximum size is 10MB");
    }

    // Validate the real content from magic bytes — never trust file.name or
    // file.type (both attacker-controlled). Rejects SVG/HTML/script payloads.
    const buffer = new Uint8Array(await file.arrayBuffer());
    const detected = sniffImageType(buffer);
    if (!detected) {
      return badRequest("Invalid file. Only JPEG, PNG, GIF, and WebP images are allowed");
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${detected.ext}`;

    const supabase = createServiceClient();

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: detected.contentType,
        upsert: false,
      });

    if (error) {
      return serverError(error.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch {
    return serverError();
  }
}
