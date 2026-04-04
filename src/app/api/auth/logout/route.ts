import { createClient } from "@/lib/supabase/server";
import { serverError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ message: "Logged out" });
  } catch {
    return serverError();
  }
}
