import { createServiceClient } from "@/lib/supabase/server";
import { getAuthenticatedArtist, unauthorized, badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;

    if (!file) {
      return badRequest("file is required");
    }

    if (!bucket) {
      return badRequest("bucket is required (reference-photos, flash-deal-photos, avatars)");
    }

    const validBuckets = ["reference-photos", "flash-deal-photos", "avatars"];
    if (!validBuckets.includes(bucket)) {
      return badRequest(`Invalid bucket. Must be one of: ${validBuckets.join(", ")}`);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return badRequest("File too large. Maximum size is 10MB");
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const supabase = createServiceClient();

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
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
