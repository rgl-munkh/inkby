import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { artists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { unauthorized, serverError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return unauthorized();
    }

    const artist = await db.query.artists.findFirst({
      where: eq(artists.id, user.id),
    });

    return NextResponse.json({ user: { id: user.id, email: user.email }, artist });
  } catch {
    return serverError();
  }
}
