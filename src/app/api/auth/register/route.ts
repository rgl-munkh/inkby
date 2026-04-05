import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { artists } from "@/lib/db/schema";
import { badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { email, password } = parsed.data;

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return badRequest(authError.message);
    }

    if (!authData.user) {
      return serverError("Failed to create user");
    }

    const [artist] = await db
      .insert(artists)
      .values({ id: authData.user.id })
      .returning();

    if (!artist) {
      return serverError("Failed to create artist profile");
    }

    return NextResponse.json({
      user: { id: authData.user.id, email: authData.user.email },
      message: "Registration successful",
    });
  } catch {
    return serverError();
  }
}
