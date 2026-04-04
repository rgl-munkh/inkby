import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

    const payment = await db.query.payments.findFirst({
      where: eq(payments.appointmentId, appointmentId),
      columns: { id: true, amount: true, status: true, paidAt: true },
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    if (!payment) {
      return notFound("Payment not found");
    }

    return NextResponse.json({ payment });
  } catch {
    return serverError();
  }
}
