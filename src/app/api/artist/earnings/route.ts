import { db } from "@/lib/db";
import { payments, appointments } from "@/lib/db/schema";
import { eq, and, gte, lt, sum } from "drizzle-orm";
import { getAuthenticatedArtist, unauthorized, serverError } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type Period = "today" | "week" | "month" | "year";

function getDateRange(period: Period): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  let from: Date;

  switch (period) {
    case "today":
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
      break;
    case "week": {
      from = new Date(now);
      const day = from.getDay();
      from.setDate(from.getDate() - day);
      from.setHours(0, 0, 0, 0);
      to.setDate(to.getDate() + (6 - to.getDay()));
      to.setHours(23, 59, 59, 999);
      break;
    }
    case "year":
      from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      to.setFullYear(now.getFullYear(), 11, 31);
      to.setHours(23, 59, 59, 999);
      break;
    case "month":
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      to.setFullYear(now.getFullYear(), now.getMonth() + 1, 0);
      to.setHours(23, 59, 59, 999);
      break;
  }

  return { from, to };
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const rawPeriod = searchParams.get("period") ?? "month";
    const period: Period = ["today", "week", "month", "year"].includes(rawPeriod)
      ? (rawPeriod as Period)
      : "month";

    const { from, to } = getDateRange(period);

    const result = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
      .where(
        and(
          eq(appointments.artistId, user.id),
          eq(payments.status, "paid"),
          gte(payments.paidAt, from),
          lt(payments.paidAt, to)
        )
      );

    const total = Number(result[0]?.total ?? 0);

    return NextResponse.json({
      total,
      period,
      from: from.toISOString(),
      to: to.toISOString(),
    });
  } catch (err) {
    console.error("Earnings fetch error:", err);
    return serverError();
  }
}
