import { createClient } from "@/lib/supabase/server";
import { badRequest, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0].message);
    }

    const { email, password } = parsed.data;
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return badRequest(error.message);
    }

    return NextResponse.json({
      user: { id: data.user.id, email: data.user.email },
      session: { access_token: data.session.access_token },
    });
  } catch {
    return serverError();
  }
}
