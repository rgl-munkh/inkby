import { createClient } from "@/lib/supabase/client";

export async function getCurrentUserEmail(): Promise<{
  hasUser: boolean;
  email: string;
}> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return {
    hasUser: Boolean(data.user),
    email: data.user?.email ?? "",
  };
}

export async function signOutArtist(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function completeArtistOnboarding({
  slug,
  instagram,
  deposit,
}: {
  slug: string;
  instagram: string;
  deposit: number;
}): Promise<{ error: string | null }> {
  const res = await fetch("/api/artist/onboarding", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug,
      instagram_username: instagram,
      deposit_amount: deposit,
    }),
  });
  const data = await res.json();

  if (!res.ok) {
    return { error: data.error ?? "Something went wrong" };
  }

  return { error: null };
}
