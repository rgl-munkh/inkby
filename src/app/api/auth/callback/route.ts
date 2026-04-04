import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function slugifyEmail(email: string): string {
  const prefix = email.split("@")[0];
  return prefix
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 30);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (!code) {
    return NextResponse.redirect(`${origin}/register?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/register?error=oauth_failed`);
  }

  const existingArtist = await db.query.artists.findFirst({
    where: eq(artists.id, data.user.id),
    columns: { id: true },
  });

  if (!existingArtist) {
    const email = data.user.email ?? "";
    let baseSlug = slugifyEmail(email);

    const slugConflict = await db.query.artists.findFirst({
      where: eq(artists.slug, baseSlug),
      columns: { id: true },
    });

    if (slugConflict) {
      baseSlug = `${baseSlug}.${Math.random().toString(36).slice(2, 6)}`;
    }

    await db.insert(artists).values({
      id: data.user.id,
      slug: baseSlug,
      displayName: (data.user.user_metadata?.full_name as string) ?? null,
      avatarUrl: (data.user.user_metadata?.avatar_url as string) ?? null,
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
