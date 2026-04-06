import { db } from "@/lib/db";
import { payments, appointments, bookingRequests } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedArtist, unauthorized, serverError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user, error: authError } = await getAuthenticatedArtist();
    if (authError || !user) return unauthorized();

    const rows = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
        firstName: bookingRequests.firstName,
        lastName: bookingRequests.lastName,
        appointmentId: appointments.id,
        chosenDatetime: appointments.chosenDatetime,
      })
      .from(payments)
      .innerJoin(appointments, eq(payments.appointmentId, appointments.id))
      .innerJoin(bookingRequests, eq(appointments.bookingRequestId, bookingRequests.id))
      .where(eq(appointments.artistId, user.id))
      .orderBy(desc(payments.createdAt));

    const totalPaid = rows
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return NextResponse.json({ transactions: rows, total_paid: totalPaid });
  } catch {
    return serverError();
  }
}
