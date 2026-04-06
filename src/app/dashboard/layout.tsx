import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { artists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BottomNav } from "@/components/dashboard/bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const artist = await db.query.artists.findFirst({
    where: eq(artists.id, user.id),
    columns: {
      slug: true,
      displayName: true,
      avatarUrl: true,
      instagramUsername: true,
      onboardingCompleted: true,
    },
  });

  if (!artist) redirect("/login");
  if (!artist.onboardingCompleted) redirect("/onboarding");

  return (
    <div className="flex h-dvh bg-inkby-canvas">
      <Sidebar artist={artist} />
      <main className="flex-1 min-w-0 pb-24 lg:pb-0 overflow-y-auto">
        {children}
      </main>
      <BottomNav artist={artist} />
    </div>
  );
}
